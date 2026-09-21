<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinkDailyStat extends Model
{
    protected $fillable = ['link_id', 'stat_date', 'clicks', 'unique_clicks'];

    protected function casts(): array
    {
        return ['stat_date' => 'date', 'clicks' => 'integer', 'unique_clicks' => 'integer'];
    }

    public function link(): BelongsTo
    {
        return $this->belongsTo(Link::class);
    }
}
