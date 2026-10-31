<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['features' => 'array', 'monthly_price' => 'integer', 'yearly_price' => 'integer', 'link_limit' => 'integer', 'is_active' => 'boolean', 'is_public' => 'boolean', 'is_default' => 'boolean'];
    }
}
