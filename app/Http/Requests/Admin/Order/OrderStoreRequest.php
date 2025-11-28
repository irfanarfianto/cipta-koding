<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderStoreRequest extends FormRequest
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
            'client_id' => 'required|uuid|exists:clients,id',
            'status'    => 'nullable|in:Menunggu Konfirmasi,Menunggu Pembayaran,Sedang Dikerjakan,Review,Selesai,Dibatalkan',
            'notes'     => 'nullable|string',
            'items'                 => 'nullable|array',
            'items.*.service_id'    => 'required_with:items|uuid|exists:services,id',
            'items.*.quantity'      => 'required_with:items|integer|min:1',
            'items.*.price'         => 'nullable|numeric|min:0',
        ];
    }

}
