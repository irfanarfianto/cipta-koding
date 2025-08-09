<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderIndexRequest extends FormRequest
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
            'status'    => 'nullable|in:Menunggu Konfirmasi,Menunggu Pembayaran,Sedang Dikerjakan,Review,Selesai,Dibatalkan',
            'client_id' => 'nullable|uuid|exists:clients,id',
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
            'search'    => 'nullable|string|max:100',
            'sort'      => 'nullable|string|max:50',
            'per_page'  => 'nullable|integer|min:5|max:100',
        ];
    }
}
