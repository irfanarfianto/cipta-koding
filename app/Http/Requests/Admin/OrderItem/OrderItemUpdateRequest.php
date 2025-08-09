<?php

namespace App\Http\Requests\Admin\OrderItem;

use Illuminate\Foundation\Http\FormRequest;

class OrderItemUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
         public function authorize(): bool { return $this->user()?->isAdmin() === true; }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array {
        return [
            'quantity' => 'required|integer|min:1',
            'price'    => 'required|numeric|min:0',
        ];
    }
}
