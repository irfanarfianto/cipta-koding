<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // TODO: Add authorization logic
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'notes' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'discount_code' => 'nullable|string|max:50',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_amount' => 'nullable|numeric|min:0',
            'estimated_completion_date' => 'nullable|date',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            
            // Order items (optional for update)
            'items' => 'nullable|array|min:1',
            'items.*.item_type' => 'required_with:items|string',
            'items.*.item_id' => 'required_with:items|uuid',
            'items.*.quantity' => 'required_with:items|integer|min:1',
            'items.*.price' => 'required_with:items|numeric|min:0',
            'items.*.customization' => 'nullable|array',
            'items.*.notes' => 'nullable|string',
        ];
    }
}
