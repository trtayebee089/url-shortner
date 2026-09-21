<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkClick extends Model
{
    protected $fillable = ['event_id', 'link_id', 'clicked_at', 'visitor_hash', 'referrer_host', 'country_code', 'region', 'city', 'device_type', 'browser', 'operating_system', 'utm'];

    protected function casts(): array
    {
        return ['clicked_at' => 'datetime', 'utm' => 'array'];
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(Link::class);
    }
}
