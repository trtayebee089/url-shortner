<?php

namespace Database\Factories;

use App\Models\Link;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Link>
 */
class LinkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'short_code' => Str::random(7),
            'custom_alias' => null,
            'destination_url' => fake()->url(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
            'expires_at' => null,
            'clicks_count' => 0,
        ];
    }
}
