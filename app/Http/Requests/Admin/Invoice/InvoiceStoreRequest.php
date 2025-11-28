<?php

namespace App\Http\Requests\Admin\Invoice;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'amount'         => ['required', 'numeric', 'min:0'],
            'due_date'       => ['required', 'date'],
            'type'           => ['nullable', 'in:dp,pelunasan,milestone,full'],
            'tax_amount'     => ['nullable', 'numeric', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'subtotal'       => ['nullable', 'numeric', 'min:0'],
            'notes'          => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string', 'max:50'],

        ];
    }
}
