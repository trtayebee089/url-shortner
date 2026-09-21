<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'short_code' => $this->short_code,
            'short_url' => $this->short_url,
            'destination_url' => $this->destination_url,
            'custom_alias' => $this->custom_alias,
            'title' => $this->title,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'is_expired' => $this->expires_at?->isPast() ?? false,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'clicks_count' => $this->clicks_count,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
