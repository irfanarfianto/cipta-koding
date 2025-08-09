<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;

class OrderUpdateStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'status' => ['required','in:Menunggu Konfirmasi,Menunggu Pembayaran,Sedang Dikerjakan,Review,Selesai,Dibatalkan'],
            'note'   => ['nullable','string'],
        ];
    }
}
