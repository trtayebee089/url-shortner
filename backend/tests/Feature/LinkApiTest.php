<?php

namespace Tests\Feature;

use App\Models\Link;
use App\Models\User;
use App\Services\ShortCodeGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LinkApiTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(): User
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        Sanctum::actingAs($user, ['*']);

        return $user;
    }

    public function test_authenticated_user_can_create_manage_and_delete_a_link(): void
    {
        $user = $this->signIn();
        $created = $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/long/path?utm_source=test#section', 'custom_alias' => 'MyLaunch', 'tags' => ['campaign']]);
        $created->assertCreated()->assertJsonPath('data.short_code', 'MyLaunch')->assertJsonPath('data.tags.0', 'campaign');
        $id = $created->json('data.id');
        $this->getJson('/api/v1/links')->assertOk()->assertJsonCount(1, 'data');
        $this->patchJson("/api/v1/links/{$id}", ['title' => 'Launch', 'is_active' => false])->assertOk()->assertJsonPath('data.title', 'Launch');
        $this->deleteJson("/api/v1/links/{$id}")->assertOk();
        $this->assertDatabaseMissing('links', ['id' => $id]);
    }

    public function test_aliases_are_unique_and_reserved_aliases_are_rejected(): void
    {
        $this->signIn();
        $payload = ['destination_url' => 'https://example.com', 'custom_alias' => 'UniqueAlias'];
        $this->postJson('/api/v1/links', $payload)->assertCreated();
        $this->postJson('/api/v1/links', $payload)->assertUnprocessable()->assertJsonValidationErrors('custom_alias');
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com', 'custom_alias' => 'dashboard'])->assertUnprocessable()->assertJsonValidationErrors('custom_alias');
    }

    public function test_alias_update_collision_returns_validation_error(): void
    {
        $user = $this->signIn();
        Link::factory()->for($user)->create(['short_code' => 'TakenAlias', 'custom_alias' => 'TakenAlias']);
        $other = Link::factory()->for($user)->create();
        $this->patchJson("/api/v1/links/{$other->id}", ['custom_alias' => 'TakenAlias'])->assertUnprocessable()->assertJsonValidationErrors('custom_alias');
    }

    public function test_random_code_collision_is_retried_against_the_database_constraint(): void
    {
        Link::factory()->create(['short_code' => 'Taken01']);
        $generator = \Mockery::mock(ShortCodeGenerator::class);
        $generator->shouldReceive('generate')->twice()->andReturn('Taken01', 'Fresh01');
        $this->app->instance(ShortCodeGenerator::class, $generator);

        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/retried'])
            ->assertCreated()
            ->assertJsonPath('data.short_code', 'Fresh01');
    }

    public function test_long_urls_are_rejected_and_query_strings_are_preserved(): void
    {
        $this->signIn();
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/path?a=1&b=two#frag'])->assertCreated()->assertJsonPath('data.destination_url', 'https://example.com/path?a=1&b=two#frag');
        $this->postJson('/api/v1/links', ['destination_url' => 'https://example.com/'.str_repeat('x', 5000)])->assertUnprocessable()->assertJsonValidationErrors('destination_url');
    }

    public function test_unicode_domains_and_encoded_paths_are_preserved(): void
    {
        $destination = 'https://例え.テスト/%E3%83%91%E3%82%B9?q=%E2%9C%93#section';

        $this->postJson('/api/v1/public/links', ['destination_url' => $destination])
            ->assertCreated()
            ->assertJsonPath('data.destination_url', $destination);
    }

    public function test_anonymous_creation_is_rate_limited(): void
    {
        config(['shortener.rate_limits.anonymous_create' => 2]);
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/one'])->assertCreated();
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/two'])->assertCreated();
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/three'])->assertStatus(429);
    }

    public function test_malicious_protocols_and_embedded_credentials_are_rejected(): void
    {
        foreach (['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,test', 'file:///etc/passwd', 'ftp://example.com/file', "https://example.com/\r\nX-Test: injected", 'https://user:pass@example.com/path'] as $url) {
            $response = $this->postJson('/api/v1/public/links', ['destination_url' => $url]);
            $this->assertSame(422, $response->status(), "Unexpected status for URL: {$url}. Body: {$response->getContent()}");
            $response->assertJsonValidationErrors('destination_url');
        }

        $this->postJson('/api/v1/public/links', ['destination_url' => ' https://example.com/path '])
            ->assertCreated()
            ->assertJsonPath('data.destination_url', 'https://example.com/path')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.clicks_count', 0);
    }

    public function test_alias_validation_rejects_route_collisions_and_unsafe_values(): void
    {
        config(['shortener.rate_limits.anonymous_create' => 100]);
        foreach (['api', 'API', 'dashboard', 'login', 'register', 'admin', 'a b', 'slash/value', 'dot.value', '../admin', '<script>', 'ユニコード', str_repeat('a', 65)] as $alias) {
            $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com', 'custom_alias' => $alias])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('custom_alias');
        }
    }

    public function test_aliases_are_case_sensitive(): void
    {
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/upper', 'custom_alias' => 'CaseKey'])->assertCreated();
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com/lower', 'custom_alias' => 'casekey'])->assertCreated();
        $this->get('/CaseKey')->assertRedirect('https://example.com/upper');
        $this->get('/casekey')->assertRedirect('https://example.com/lower');
    }

    public function test_users_cannot_access_each_others_links(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->for($owner)->create();
        $this->signIn();
        $this->getJson("/api/v1/links/{$link->id}")->assertForbidden();
        $this->patchJson("/api/v1/links/{$link->id}", ['title' => 'Stolen'])->assertForbidden();
        $this->deleteJson("/api/v1/links/{$link->id}")->assertForbidden();
    }

    public function test_anonymous_creation_can_be_disabled(): void
    {
        config(['shortener.allow_anonymous' => false]);
        $this->postJson('/api/v1/public/links', ['destination_url' => 'https://example.com'])->assertForbidden();
    }
}
