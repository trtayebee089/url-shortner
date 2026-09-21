<?php

namespace App\Services;

use App\Models\Link;
use App\Models\Tag;
use App\Models\User;
use App\Services\Abuse\UrlSafetyProvider;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UrlShorteningService
{
    public function __construct(
        private readonly UrlSafetyProvider $safety,
        private readonly ShortCodeGenerator $codes,
        private readonly ShortLinkCache $cache,
    ) {}

    public function create(array $data, ?User $user): Link
    {
        $this->assertSafe($data['destination_url']);
        $alias = $data['custom_alias'] ?? null;

        if ($alias) {
            $this->assertAliasAllowed($alias);
            try {
                $link = $this->persist($data, $user, $alias);
                $this->forget($link->short_code);

                return $link;
            } catch (QueryException $exception) {
                if ($this->isShortCodeUniqueViolation($exception)) {
                    throw ValidationException::withMessages(['custom_alias' => ['That custom alias is already in use.']]);
                }
                throw $exception;
            }
        }

        $maxAttempts = min(max((int) config('shortener.max_generation_attempts'), 1), 50);
        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            try {
                $link = $this->persist($data, $user, $this->codes->generate());
                $this->forget($link->short_code);

                return $link;
            } catch (QueryException $exception) {
                if (! $this->isShortCodeUniqueViolation($exception)) {
                    throw $exception;
                }
            }
        }

        throw ValidationException::withMessages(['destination_url' => ['A short code could not be allocated. Please try again.']]);
    }

    public function update(Link $link, array $data): Link
    {
        $oldCode = $link->short_code;
        if (isset($data['destination_url'])) {
            $this->assertSafe($data['destination_url']);
        }
        if (array_key_exists('custom_alias', $data) && $data['custom_alias'] && $data['custom_alias'] !== $link->custom_alias) {
            $this->assertAliasAllowed($data['custom_alias']);
            $data['short_code'] = $data['custom_alias'];
        }

        try {
            $updated = DB::transaction(function () use ($link, $data) {
                $tags = $data['tags'] ?? null;
                unset($data['tags']);
                $link->update($data);
                if (is_array($tags)) {
                    $this->syncTags($link, $tags);
                }

                return $link->fresh('tags');
            });
            $this->forget($oldCode);
            $this->forget($updated->short_code);

            return $updated;
        } catch (QueryException $exception) {
            if ($this->isShortCodeUniqueViolation($exception)) {
                throw ValidationException::withMessages(['custom_alias' => ['That custom alias is already in use.']]);
            }
            throw $exception;
        }
    }

    public function forget(string $code): void
    {
        $this->cache->forget($code);
    }

    private function persist(array $data, ?User $user, string $code): Link
    {
        return DB::transaction(function () use ($data, $user, $code) {
            $tags = $data['tags'] ?? [];
            unset($data['tags']);
            $link = Link::create([
                ...$data,
                'user_id' => $user?->id,
                'short_code' => $code,
                'custom_alias' => $data['custom_alias'] ?? null,
            ]);
            if ($user && $tags) {
                $this->syncTags($link, $tags);
            }

            return $link->fresh('tags');
        });
    }

    private function syncTags(Link $link, array $tags): void
    {
        if (! $link->user_id) {
            return;
        }
        $ids = collect($tags)->filter()->unique()->take(10)->map(function (string $name) use ($link) {
            $name = Str::limit(trim($name), 60, '');

            return Tag::firstOrCreate(['user_id' => $link->user_id, 'slug' => Str::slug($name)], ['name' => $name])->id;
        });
        $link->tags()->sync($ids);
    }

    private function assertAliasAllowed(string $alias): void
    {
        $reserved = array_map('strtolower', config('shortener.reserved_aliases', []));
        if (in_array(strtolower($alias), $reserved, true)) {
            throw ValidationException::withMessages(['custom_alias' => ['That alias is reserved.']]);
        }
    }

    private function assertSafe(string $url): void
    {
        $result = $this->safety->inspect($url);
        if (! $result['allowed']) {
            throw ValidationException::withMessages(['destination_url' => [$result['reason']]]);
        }
    }

    private function isShortCodeUniqueViolation(QueryException $exception): bool
    {
        if (! in_array((string) $exception->getCode(), ['23000', '23505', '19'], true)) {
            return false;
        }

        $message = strtolower($exception->getMessage());

        return str_contains($message, 'links.short_code')
            || str_contains($message, 'links_short_code_unique')
            || str_contains($message, 'links.custom_alias')
            || str_contains($message, 'links_custom_alias_unique');
    }
}
