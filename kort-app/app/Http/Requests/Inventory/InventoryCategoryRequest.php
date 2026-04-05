<?php

namespace App\Http\Requests\Inventory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InventoryCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'name' => ['required', 'string', 'max:160', Rule::unique('inventory_categories', 'name')->ignore($categoryId)],
            'code' => ['required', 'string', 'max:30', Rule::unique('inventory_categories', 'code')->ignore($categoryId)],
            'description' => ['nullable', 'string', 'max:5000'],
            'parent_id' => ['nullable', 'exists:inventory_categories,id'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
