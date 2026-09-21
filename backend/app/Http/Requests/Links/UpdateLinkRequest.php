<?php

namespace App\Http\Requests\Links;

use App\Rules\SafeHttpUrl;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('link')) ?? false;
    }

    public function rules(): array
    {
        return [
            'destination_url' => ['sometimes', 'string', new SafeHttpUrl],
            'custom_alias' => ['sometimes', 'nullable', 'string', 'min:3', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/'],
            'title' => ['sometimes', 'nullable', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:60'],
        ];
    }
}
