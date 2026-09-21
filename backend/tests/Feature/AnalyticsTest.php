<?php

namespace Tests\Feature;

use App\Jobs\RecordLinkClick;
use App\Models\Link;
use App\Models\LinkClick;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_incoming_short_url_utm_parameters_are_recorded(): void
    {
        $link = Link::factory()->create([
            'short_code' => 'UtmPass',
            'destination_url' => 'https://example.com/path?existing=1',
        ]);

        $this->get('/UtmPass?utm_source=short-url&utm_campaign=launch')->assertRedirect();

        $this->assertDatabaseHas('link_clicks', ['link_id' => $link->id]);
        $utm = LinkClick::whereBelongsTo($link)->firstOrFail()->utm;
        $this->assertSame('short-url', $utm['utm_source']);
        $this->assertSame('launch', $utm['utm_campaign']);
    }

    public function test_click_job_records_privacy_limited_event_and_aggregates(): void
    {
        $link = Link::factory()->create(['destination_url' => 'https://example.com?utm_source=newsletter']);
        $context = $this->context();
        (new RecordLinkClick($link->id, $context))->handle();
        $this->assertDatabaseHas('link_clicks', ['link_id' => $link->id, 'country_code' => 'BD', 'browser' => 'Chrome', 'device_type' => 'desktop']);
        $this->assertDatabaseHas('link_daily_stats', ['link_id' => $link->id, 'clicks' => 1, 'unique_clicks' => 1]);
        $this->assertDatabaseHas('links', ['id' => $link->id, 'clicks_count' => 1]);
    }

    public function test_owner_can_read_analytics(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->for($user)->create();
        Sanctum::actingAs($user, ['*']);
        $this->getJson("/api/v1/links/{$link->id}/analytics?period=7d")->assertOk()->assertJsonPath('data.period', '7d')->assertJsonCount(7, 'data.timeline');
    }

    public function test_account_analytics_aggregates_only_the_authenticated_users_links(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $owned = Link::factory()->for($user)->create();
        $other = Link::factory()->create();
        (new RecordLinkClick($owned->id, $this->context()))->handle();
        (new RecordLinkClick($other->id, [...$this->context(), 'event_id' => (string) Str::uuid()]))->handle();
        Sanctum::actingAs($user, ['*']);

        $this->getJson('/api/v1/analytics?period=7d')
            ->assertOk()
            ->assertJsonPath('data.period', '7d')
            ->assertJsonPath('data.total_clicks', 1)
            ->assertJsonPath('data.unique_clicks', 1)
            ->assertJsonCount(7, 'data.timeline');
    }

    public function test_qr_endpoint_returns_svg(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->for($user)->create();
        Sanctum::actingAs($user, ['*']);
        $this->get("/api/v1/links/{$link->id}/qr")->assertOk()->assertHeader('Content-Type', 'image/svg+xml')->assertSee('<svg', false);
    }

    public function test_duplicate_event_is_idempotent_and_repeat_visitor_is_not_double_counted(): void
    {
        $link = Link::factory()->create();
        $context = $this->context();
        (new RecordLinkClick($link->id, $context))->handle();
        (new RecordLinkClick($link->id, $context))->handle();
        (new RecordLinkClick($link->id, [...$context, 'event_id' => (string) Str::uuid()]))->handle();

        $this->assertDatabaseCount('link_clicks', 2);
        $this->assertDatabaseHas('links', ['id' => $link->id, 'clicks_count' => 2]);
        $this->assertDatabaseHas('link_daily_stats', ['link_id' => $link->id, 'clicks' => 2, 'unique_clicks' => 1]);
        $this->assertDatabaseCount('link_daily_visitors', 1);
    }

    public function test_malformed_event_fails_and_deleted_link_is_ignored(): void
    {
        $link = Link::factory()->create();
        $linkId = $link->id;
        $link->delete();
        (new RecordLinkClick($linkId, $this->context()))->handle();
        $this->assertDatabaseCount('link_clicks', 0);

        $this->expectException(InvalidArgumentException::class);
        (new RecordLinkClick($linkId, ['event_id' => 'invalid']))->handle();
    }

    public function test_analytics_and_qr_are_not_accessible_cross_user(): void
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->for($owner)->create();
        Sanctum::actingAs(User::factory()->create(['email_verified_at' => now()]), ['*']);

        $this->getJson("/api/v1/links/{$link->id}/analytics")->assertForbidden();
        $this->get("/api/v1/links/{$link->id}/qr")->assertForbidden();
    }

    private function context(): array
    {
        return ['event_id' => (string) Str::uuid(), 'clicked_at' => now()->toIso8601String(), 'visitor_hash' => str_repeat('a', 64), 'user_agent' => 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'referer' => 'https://search.example/result', 'country' => 'BD', 'region' => null, 'city' => null];
    }
}
