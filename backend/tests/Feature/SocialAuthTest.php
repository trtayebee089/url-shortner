<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as ProviderUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    private function configured(string $provider): void
    {
        config()->set('services.'.$provider, $provider === 'google' ? [
            'client_id' => 'google-test-id',
            'client_secret' => 'google-test-secret',
            'redirect' => 'http://localhost:8000/api/v1/auth/google/callback',
        ] : [
            'client_id' => 'apple.test.service',
            'client_secret' => null,
            'team_id' => 'APPLETEAM',
            'key_id' => 'APPLEKEY',
            'private_key' => __FILE__,
            'redirect' => 'https://api.example.test/api/v1/auth/apple/callback',
        ]);
    }

    private function start(string $provider, ProviderUser $identity, bool $providerFails = false): array
    {
        $this->configured($provider);
        $driver = Mockery::mock();
        $driver->shouldReceive('stateless')->andReturnSelf();
        if ($provider === 'apple') {
            $driver->shouldReceive('cookieNonce')->andReturnSelf();
        }
        $state = '';
        $driver->shouldReceive('with')->once()->andReturnUsing(function (array $parameters) use ($driver, &$state) {
            $state = $parameters['state'];

            return $driver;
        });
        $driver->shouldReceive('redirect')->once()->andReturnUsing(function () use (&$state) {
            return redirect()->away('https://provider.example/authorize?state='.$state);
        });
        if ($providerFails) {
            $driver->shouldReceive('user')->andThrow(new \RuntimeException('provider unavailable'));
        } else {
            $driver->shouldReceive('user')->andReturn($identity);
        }
        Socialite::shouldReceive('driver')->with($provider)->andReturn($driver);

        $response = $this->get('/api/v1/auth/'.$provider.'/redirect');
        $response->assertRedirect();
        $this->assertStringContainsString('https://provider.example/authorize?state=', $response->headers->get('Location'));
        $stateCookie = collect($response->headers->getCookies())->first(fn ($cookie) => $cookie->getName() === 'social_auth_'.$provider.'_state');
        $this->assertNotNull($stateCookie);
        $this->assertSame($state, $stateCookie->getValue());
        $this->assertTrue(Cache::has('social-auth-state:'.$provider.':'.hash('sha256', $state)));

        return [$state, $stateCookie->getValue()];
    }

    private function callbackAndExchange(string $provider, string $state, string $cookie, string $method = 'get'): array
    {
        $path = '/api/v1/auth/'.$provider.'/callback';
        $response = $method === 'post'
            ? $this->withUnencryptedCookie('social_auth_'.$provider.'_state', $cookie)->post($path, ['state' => $state, 'code' => 'provider-code'])
            : $this->withUnencryptedCookie('social_auth_'.$provider.'_state', $cookie)->get($path.'?state='.$state.'&code=provider-code');
        $response->assertRedirect();
        $location = $response->headers->get('Location');
        $this->assertStringContainsString('/auth/complete?ticket=', $location);
        parse_str((string) parse_url($location, PHP_URL_QUERY), $query);
        $handoff = collect($response->headers->getCookies())->first(fn ($item) => $item->getName() === 'social_auth_handoff');
        $this->assertNotNull($handoff);

        $exchange = $this->withUnencryptedCookie('social_auth_handoff', $handoff->getValue())
            ->withCredentials()->postJson('/api/v1/auth/social/exchange', ['ticket' => $query['ticket']]);
        $exchange->assertOk()->assertJsonStructure(['data' => ['user', 'token']]);

        return [$exchange->json('data.user'), $exchange->json('data.token'), $query['ticket']];
    }

    public function test_real_socialite_drivers_build_google_and_apple_authorization_redirects(): void
    {
        $this->configured('google');
        $this->configured('apple');

        $google = $this->get('/api/v1/auth/google/redirect')->assertRedirect();
        $this->assertStringStartsWith('https://accounts.google.com/', $google->headers->get('Location'));
        parse_str((string) parse_url($google->headers->get('Location'), PHP_URL_QUERY), $googleQuery);
        $this->assertSame('http://localhost:8000/api/v1/auth/google/callback', $googleQuery['redirect_uri']);
        $this->assertNotEmpty($googleQuery['state']);

        $apple = $this->get('/api/v1/auth/apple/redirect')->assertRedirect();
        $this->assertStringStartsWith('https://appleid.apple.com/auth/authorize', $apple->headers->get('Location'));
        parse_str((string) parse_url($apple->headers->get('Location'), PHP_URL_QUERY), $appleQuery);
        $this->assertSame('form_post', $appleQuery['response_mode']);
        $this->assertSame('https://api.example.test/api/v1/auth/apple/callback', $appleQuery['redirect_uri']);
        $this->assertNotEmpty($appleQuery['state']);
        $this->assertNotEmpty($appleQuery['nonce']);
        $this->assertNotNull(collect($apple->headers->getCookies())->first(fn ($cookie) => $cookie->getName() === 'socialite_apple_nonce'));
    }

    public function test_google_creates_a_user_and_issues_the_normal_sanctum_token(): void
    {
        [$state, $cookie] = $this->start('google', ProviderUser::fake([
            'id' => 'google-sub-1', 'name' => 'Ada Example', 'email' => 'ada@example.com', 'email_verified' => true,
        ]));
        [$user, $token, $ticket] = $this->callbackAndExchange('google', $state, $cookie);
        $this->assertDatabaseHas('social_accounts', ['provider' => 'google', 'provider_id' => 'google-sub-1', 'user_id' => $user['id']]);
        $this->assertNotNull(User::findOrFail($user['id'])->email_verified_at);
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.id', $user['id']);
        $this->withToken($token)->getJson('/api/v1/links')->assertOk();
        $this->withUnencryptedCookie('social_auth_handoff', $cookie)->withCredentials()->postJson('/api/v1/auth/social/exchange', ['ticket' => $ticket])->assertUnprocessable();
        $this->withToken($token)->withCredentials()->postJson('/api/v1/auth/logout')->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['token' => hash('sha256', explode('|', $token, 2)[1])]);
    }

    public function test_google_links_an_existing_email_password_user(): void
    {
        $existing = User::factory()->unverified()->create(['email' => 'member@example.com']);
        [$state, $cookie] = $this->start('google', ProviderUser::fake([
            'id' => 'google-sub-2', 'email' => 'member@example.com', 'email_verified' => true,
        ]));
        [$user] = $this->callbackAndExchange('google', $state, $cookie);
        $this->assertSame($existing->id, $user['id']);
        $this->assertSame(1, User::where('email', 'member@example.com')->count());
        $this->assertNotNull($existing->fresh()->email_verified_at);
    }

    public function test_apple_creates_a_user_from_private_relay_email(): void
    {
        [$state, $cookie] = $this->start('apple', ProviderUser::fake([
            'id' => 'apple-sub-1', 'name' => 'Ada Apple', 'email' => 'relay@privaterelay.appleid.com', 'email_verified' => 'true',
        ]));
        [$user, $token] = $this->callbackAndExchange('apple', $state, $cookie, 'post');
        $this->assertDatabaseHas('social_accounts', ['provider' => 'apple', 'provider_id' => 'apple-sub-1', 'user_id' => $user['id']]);
        $this->withToken($token)->getJson('/api/v1/links')->assertOk();
    }

    public function test_returning_apple_user_can_sign_in_without_name_or_email(): void
    {
        $existing = User::factory()->create(['email' => 'relay@privaterelay.appleid.com']);
        $existing->socialAccounts()->create(['provider' => 'apple', 'provider_id' => 'apple-sub-1']);
        [$nextState, $nextCookie] = $this->start('apple', ProviderUser::fake([
            'id' => 'apple-sub-1', 'name' => null, 'email' => null, 'email_verified' => null,
        ]));
        [$returning] = $this->callbackAndExchange('apple', $nextState, $nextCookie, 'post');
        $this->assertSame($existing->id, $returning['id']);
        $this->assertSame(1, User::count());
    }

    public function test_apple_links_an_existing_verified_email_account(): void
    {
        $existing = User::factory()->create(['email' => 'apple@example.com']);
        [$state, $cookie] = $this->start('apple', ProviderUser::fake([
            'id' => 'apple-sub-2', 'email' => 'apple@example.com', 'email_verified' => 'true',
        ]));
        [$user] = $this->callbackAndExchange('apple', $state, $cookie, 'post');
        $this->assertSame($existing->id, $user['id']);
        $this->assertSame(1, User::count());
    }

    public function test_missing_configuration_invalid_state_and_unverified_email_fail_closed(): void
    {
        $this->get('/api/v1/auth/google/redirect')->assertRedirectContains('oauth_error=configuration');
        [$state, $cookie] = $this->start('google', ProviderUser::fake([
            'id' => 'google-sub-3', 'email' => 'unverified@example.com', 'email_verified' => false,
        ]));
        $this->withUnencryptedCookie('social_auth_google_state', 'wrong')->get('/api/v1/auth/google/callback?state='.$state.'&code=provider-code')
            ->assertRedirectContains('oauth_error=state');
        $this->withUnencryptedCookie('social_auth_google_state', $cookie)->get('/api/v1/auth/google/callback?state='.$state.'&code=provider-code')
            ->assertRedirectContains('oauth_error=email');
        $this->assertSame(0, User::count());
    }

    public function test_provider_error_and_cancelled_callback_are_safe(): void
    {
        [$state, $cookie] = $this->start('apple', ProviderUser::fake(['email_verified' => true]));
        $this->withUnencryptedCookie('social_auth_apple_state', $cookie)->post('/api/v1/auth/apple/callback', [
            'state' => $state, 'error' => 'user_cancelled_authorize',
        ])->assertRedirectContains('oauth_error=cancelled');
        $this->assertSame(0, User::count());
    }

    public function test_provider_exception_does_not_create_or_sign_in_a_user(): void
    {
        [$state, $cookie] = $this->start('google', ProviderUser::fake(), true);
        $this->withUnencryptedCookie('social_auth_google_state', $cookie)
            ->get('/api/v1/auth/google/callback?state='.$state.'&code=provider-code')
            ->assertRedirectContains('oauth_error=provider');
        $this->assertSame(0, User::count());
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
