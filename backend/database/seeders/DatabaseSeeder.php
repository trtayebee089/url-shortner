<?php

namespace Database\Seeders;

use App\Models\Link;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->warn('Demo data was not created in production.');

            return;
        }

        $password = env('DEMO_USER_PASSWORD');
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make(is_string($password) && $password !== '' ? $password : Str::random(40)),
        ]);
        Link::factory(8)->for($user)->create();
    }
}
