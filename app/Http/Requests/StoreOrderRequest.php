<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'client_id' => 'required|uuid|exists:clients,id',
            'notes' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'discount_code' => 'nullable|string|max:50',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_amount' => 'nullable|numeric|min:0',
            'estimated_completion_date' => 'nullable|date|after:today',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            
            // Order items
            'items' => 'required|array|min:1',
            'items.*.item_type' => 'required|string',
            'items.*.item_id' => 'required|uuid',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.customization' => 'nullable|array',
            'items.*.notes' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'client_id.required' => 'Client harus dipilih',
            'client_id.exists' => 'Client tidak ditemukan',
            'items.required' => 'Order harus memiliki minimal 1 item',
            'items.*.quantity.min' => 'Quantity minimal 1',
            'items.*.price.min' => 'Harga tidak boleh negatif',
        ];
    }
}
