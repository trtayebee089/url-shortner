<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StaffRole extends Model
{
    protected $guarded = ['id', 'is_system'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role', 'slug');
    }

    protected function casts(): array
    {
        return ['permissions' => 'array', 'is_system' => 'boolean', 'is_active' => 'boolean'];
    }
}
