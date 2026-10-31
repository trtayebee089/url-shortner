<?php

namespace Tests\Feature;

use App\Models\Link;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClickTrackingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_redirects_are_recorded_by_the_database_worker_and_reported_by_the_api(): void
    {
        config()->set('queue.default', 'database');

        $owner = User::factory()->create(['email_verified_at' => now()]);
        $link = Link::factory()->for($owner)->create([
            'short_code' => 'Track123',
            'destination_url' => 'https://example.com/campaign',
        ]);
        Link::factory()->create(['short_code' => 'Off1234', 'is_active' => false]);
        Link::factory()->create(['short_code' => 'Past123', 'expires_at' => now()->subMinute()]);

        foreach (range(1, 3) as $visit) {
            $this->get('/Track123')->assertRedirect('https://example.com/campaign');
        }
        $this->get('/Off1234')->assertGone();
        $this->get('/Past123')->assertGone();
        $this->get('/Unknown123')->assertNotFound();

        $this->assertSame(3, Queue::connection('database')->size('analytics'));
        $this->assertDatabaseHas('links', ['id' => $link->id, 'clicks_count' => 0]);

        foreach (range(1, 3) as $job) {
            $this->assertSame(0, Artisan::call('queue:work', [
                'connection' => 'database',
                '--queue' => 'analytics',
                '--once' => true,
                '--tries' => 3,
            ]));
        }

        $this->assertSame(0, Queue::connection('database')->size('analytics'));
        $this->assertDatabaseCount('link_clicks', 3);
        $this->assertDatabaseHas('links', ['id' => $link->id, 'clicks_count' => 3]);
        $this->assertDatabaseHas('link_daily_stats', ['link_id' => $link->id, 'clicks' => 3]);
        $this->assertDatabaseCount('failed_jobs', 0);

        Sanctum::actingAs($owner, ['*']);
        $this->getJson('/api/v1/links')->assertOk()->assertJsonPath('data.0.clicks_count', 3);
        $this->getJson("/api/v1/links/{$link->id}/analytics?period=7d")
            ->assertOk()
            ->assertJsonPath('data.total_clicks', 3);
    }
}
