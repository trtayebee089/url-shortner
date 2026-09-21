<?php

namespace App\Http\Requests\Links;

use App\Rules\SafeHttpUrl;
use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'destination_url' => ['required', 'string', new SafeHttpUrl],
            'custom_alias' => ['nullable', 'string', 'min:3', 'max:64', 'regex:/^[A-Za-z0-9_-]+$/'],
            'title' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'is_active' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:60'],
        ];
    }
}
