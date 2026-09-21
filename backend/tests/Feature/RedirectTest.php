<?php

namespace Tests\Feature;

use App\Jobs\RecordLinkClick;
use App\Models\Link;
use App\Models\User;
use App\Services\RedirectService;
use App\Services\ShortLinkCache;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use RuntimeException;
use Tests\TestCase;

class RedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_link_redirects_and_queues_analytics(): void
    {
        Queue::fake();
        $link = Link::factory()->create(['short_code' => 'Ab12Cd', 'destination_url' => 'https://example.com/path?x=1']);
        $this->get('/Ab12Cd')->assertRedirect('https://example.com/path?x=1')->assertStatus(302);
        Queue::assertPushed(RecordLinkClick::class, fn ($job) => $job->linkId === $link->id);
        $this->assertTrue(Cache::has('short-link:Ab12Cd'));
        $this->assertEmpty($this->get('/Ab12Cd')->headers->getCookies());
    }

    public function test_missing_disabled_and_expired_links_are_handled(): void
    {
        $this->get('/Missing')->assertNotFound();
        Link::factory()->create(['short_code' => 'Disabled', 'is_active' => false]);
        Link::factory()->create(['short_code' => 'Expired', 'expires_at' => now()->subMinute()]);
        $this->get('/Disabled')->assertStatus(410)->assertSee('disabled');
        $this->get('/Expired')->assertStatus(410)->assertSee('expired');
    }

    public function test_link_updates_invalidate_redirect_cache(): void
    {
        $link = Link::factory()->create(['short_code' => 'Cached1']);
        Cache::put('short-link:Cached1', ['destination_url' => 'https://old.example', 'is_active' => true, 'expires_at' => null, 'id' => $link->id], 600);
        $user = $link->user;
        $user->forceFill(['email_verified_at' => now()])->save();
        Sanctum::actingAs($user, ['*']);
        $this->patchJson("/api/v1/links/{$link->id}", ['destination_url' => 'https://new.example'])->assertOk();
        $this->assertFalse(Cache::has('short-link:Cached1'));
    }

    public function test_cache_corruption_falls_back_to_database(): void
    {
        Queue::fake();
        Link::factory()->create(['short_code' => 'Corrupt1', 'destination_url' => 'https://example.com/correct']);
        Cache::put('short-link:Corrupt1', ['destination_url' => "https://evil.example\r\nX-Test: injected"], 600);

        $this->get('/Corrupt1')->assertRedirect('https://example.com/correct');
        $this->assertSame('https://example.com/correct', Cache::get('short-link:Corrupt1')['destination_url']);
    }

    public function test_unsafe_or_malformed_cached_metadata_is_never_redirected(): void
    {
        $link = Link::factory()->create(['short_code' => 'SafeDb1', 'destination_url' => 'https://safe.example/path']);

        Cache::put('short-link:SafeDb1', [
            'id' => $link->id,
            'destination_url' => "https://evil.example/\r\nX-Injected: yes",
            'is_active' => true,
            'expires_at' => null,
        ]);
        $this->get('/SafeDb1')->assertRedirect('https://safe.example/path');

        Cache::put('short-link:SafeDb1', [
            'id' => $link->id,
            'destination_url' => 'https://evil.example',
            'is_active' => true,
            'expires_at' => 'not-a-date',
        ]);
        $this->get('/SafeDb1')->assertRedirect('https://safe.example/path');
    }

    public function test_unicode_destination_remains_cacheable_and_redirectable(): void
    {
        $destination = 'https://例え.テスト/%E3%83%91%E3%82%B9?q=%E2%9C%93';
        Link::factory()->create(['short_code' => 'Unicode1', 'destination_url' => $destination]);

        $this->get('/Unicode1')->assertRedirect($destination);
        $this->get('/Unicode1')->assertRedirect($destination);
        $this->assertNotNull(Cache::get('short-link:Unicode1'));
    }

    public function test_negative_cache_is_invalidated_when_alias_is_created(): void
    {
        Queue::fake();
        $this->get('/Future1')->assertNotFound();
        $this->assertTrue(Cache::has('short-link:Future1'));
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/future', 'custom_alias' => 'Future1'])->assertCreated();

        $this->get('/Future1')->assertRedirect('https://example.com/future');
    }

    public function test_alias_change_invalidates_old_and_preexisting_new_cache_keys(): void
    {
        $link = Link::factory()->create(['short_code' => 'OldAlias', 'custom_alias' => 'OldAlias']);
        Cache::put('short-link:OldAlias', ['id' => $link->id, 'destination_url' => $link->destination_url, 'is_active' => true, 'expires_at' => null], 600);
        Cache::put('short-link:NewAlias', ['missing' => true], 600);
        $link->user->forceFill(['email_verified_at' => now()])->save();
        Sanctum::actingAs($link->user, ['*']);

        $this->patchJson("/api/v1/links/{$link->id}", ['custom_alias' => 'NewAlias'])->assertOk();
        $this->assertFalse(Cache::has('short-link:OldAlias'));
        $this->assertFalse(Cache::has('short-link:NewAlias'));
    }

    public function test_disable_and_delete_invalidate_cached_redirects(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $disabled = Link::factory()->for($user)->create(['short_code' => 'Disable1']);
        $deleted = Link::factory()->for($user)->create(['short_code' => 'Delete01']);
        foreach ([$disabled, $deleted] as $link) {
            Cache::put('short-link:'.$link->short_code, ['id' => $link->id, 'destination_url' => $link->destination_url, 'is_active' => true, 'expires_at' => null], 600);
        }
        Sanctum::actingAs($user, ['*']);

        $this->patchJson("/api/v1/links/{$disabled->id}", ['is_active' => false])->assertOk();
        $this->assertFalse(Cache::has('short-link:Disable1'));
        $this->get('/Disable1')->assertGone();

        $this->deleteJson("/api/v1/links/{$deleted->id}")->assertOk();
        $this->assertFalse(Cache::has('short-link:Delete01'));
        $this->get('/Delete01')->assertNotFound();
    }

    public function test_cache_client_failures_are_swallowed_by_the_cache_adapter(): void
    {
        Cache::shouldReceive('get')->once()->andThrow(new RuntimeException('redis unavailable'));
        $this->assertNull(app(ShortLinkCache::class)->get('Fallback1'));
    }

    public function test_redis_outage_falls_back_to_database_resolution(): void
    {
        Queue::fake();
        $link = Link::factory()->create(['short_code' => 'Fallback1', 'destination_url' => 'https://example.com/fallback']);
        Cache::shouldReceive('get')->once()->andThrow(new RuntimeException('redis unavailable'));
        Cache::shouldReceive('put')->once()->andThrow(new RuntimeException('redis unavailable'));

        $result = app(RedirectService::class)->resolve($link->short_code, Request::create('/Fallback1'));
        $this->assertSame(['state' => 'ok', 'destination_url' => 'https://example.com/fallback'], $result);
    }

    public function test_queue_outage_does_not_block_a_valid_redirect(): void
    {
        Link::factory()->create(['short_code' => 'QueueDown', 'destination_url' => 'https://example.com/available']);
        $this->mock(Dispatcher::class)->shouldReceive('dispatch')->once()->andThrow(new RuntimeException('queue unavailable'));

        $this->get('/QueueDown')->assertRedirect('https://example.com/available');
    }

    public function test_malformed_short_codes_do_not_reach_redirect_resolution(): void
    {
        $this->get('/ab')->assertNotFound();
        $this->get('/bad.code')->assertNotFound();
        $this->get('/bad%2Fcode')->assertNotFound();
    }
}
