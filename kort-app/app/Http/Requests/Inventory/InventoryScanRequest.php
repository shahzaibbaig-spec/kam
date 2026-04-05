<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class InventoryScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('inventory-item.scan') ?? false;
    }

    public function rules(): array
    {
        return [
            'query' => ['required', 'string', 'max:120'],
        ];
    }
}
