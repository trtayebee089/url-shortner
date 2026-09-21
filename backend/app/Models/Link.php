<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Link extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'short_code', 'custom_alias', 'destination_url', 'title', 'description', 'is_active', 'expires_at'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'expires_at' => 'datetime', 'clicks_count' => 'integer'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(LinkClick::class);
    }

    public function dailyStats(): HasMany
    {
        return $this->hasMany(LinkDailyStat::class);
    }

    public function getShortUrlAttribute(): string
    {
        return rtrim((string) config('shortener.domain'), '/').'/'.$this->short_code;
    }

    public function isResolvable(): bool
    {
        return $this->is_active && (! $this->expires_at || $this->expires_at->isFuture());
    }
}
