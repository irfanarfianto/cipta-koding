<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderBulkStatusRequest extends FormRequest
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
    public function rules(): array
    {
        return [
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'uuid|exists:orders,id',
            'status' => 'required|in:Menunggu Konfirmasi,Menunggu Pembayaran,Sedang Dikerjakan,Review,Selesai,Dibatalkan',
            'note'   => 'nullable|string|max:500',
        ];
    }
}
