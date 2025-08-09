<?php

namespace App\Http\Requests\Admin\Payment;

use Illuminate\Foundation\Http\FormRequest;

class PaymentStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'amount'    => ['required','numeric','min:0.0001'],
            'method'    => ['nullable','string','max:50'],
            'reference' => ['nullable','string','max:100'],
            'paid_at'   => ['nullable','date'],
        ];
    }
    
}
