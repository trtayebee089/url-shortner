<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\BillingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ProvisionSuperAdmin extends Command
{
    protected $signature = 'admin:provision {email} {--create} {--send-reset}';

    protected $description = 'Provision a verified superadmin without a default or printed password';

    public function handle(): int
    {
        $email = strtolower(trim($this->argument('email')));
        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('A valid email is required.');

            return self::FAILURE;
        }
        $user = DB::transaction(function () use ($email) {
            $user = User::where('email', $email)->lockForUpdate()->first();
            if (! $user && ! $this->option('create')) {
                return null;
            }
            $user ??= new User(['email' => $email, 'name' => '247URL Administrator', 'password' => Str::random(64)]);
            $user->forceFill(['role' => 'superadmin', 'status' => 'active', 'email_verified_at' => $user->email_verified_at ?? now()])->save();
            app(BillingService::class)->audit(null, 'superadmin.provisioned', 'user', $user->id, ['source' => 'console']);

            return $user;
        });
        if (! $user) {
            $this->error('Account not found. Use --create to create it.');

            return self::FAILURE;
        }
        $this->info('Superadmin provisioned. Existing passwords were preserved.');
        if ($this->option('send-reset')) {
            $status = Password::sendResetLink(['email' => $email]);
            $this->line(__($status));

            return $status === Password::RESET_LINK_SENT ? self::SUCCESS : self::FAILURE;
        }

        return self::SUCCESS;
    }
}
