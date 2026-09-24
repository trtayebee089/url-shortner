<?php

namespace App\Services;

use App\Exceptions\SocialAuthenticationException;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\AbstractUser as ProviderUser;

class SocialAccountService
{
    public function resolve(string $provider, ProviderUser $identity): User
    {
        $providerId = trim((string) $identity->getId());
        if ($providerId === '' || strlen($providerId) > 191) {
            throw new SocialAuthenticationException('identity');
        }

        return DB::transaction(function () use ($provider, $providerId, $identity) {
            $account = SocialAccount::query()
                ->where('provider', $provider)
                ->where('provider_id', $providerId)
                ->first();

            if ($account) {
                $user = $account->user;
                $this->ensureActive($user);

                return $user;
            }

            $email = strtolower(trim((string) $identity->getEmail()));
            $raw = $identity->getRaw();
            $verified = filter_var($raw['email_verified'] ?? $raw['verified_email'] ?? false, FILTER_VALIDATE_BOOLEAN);
            if (! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $verified) {
                throw new SocialAuthenticationException('email');
            }

            $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->lockForUpdate()->first();
            if ($user) {
                $this->ensureActive($user);
                if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
                    event(new Verified($user));
                }
            } else {
                $name = trim((string) $identity->getName());
                $user = User::create([
                    'name' => Str::limit($name !== '' ? $name : Str::before($email, '@'), 120, ''),
                    'email' => $email,
                    'password' => Str::random(64),
                ]);
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            $user->socialAccounts()->create(['provider' => $provider, 'provider_id' => $providerId]);

            return $user;
        });
    }

    private function ensureActive(User $user): void
    {
        if ($user->status !== 'active') {
            throw new SocialAuthenticationException('disabled');
        }
    }
}
