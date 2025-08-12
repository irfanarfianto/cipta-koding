<?php

namespace App\Http\Requests\Admin\Invoice;

use Illuminate\Foundation\Http\FormRequest;

class InvoiceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return [
            'amount'   => ['sometimes', 'numeric', 'min:0'],
            'due_date' => ['sometimes', 'date'],
            'type'     => ['sometimes', 'in:dp,pelunasan,milestone,full'],
            'status'   => ['sometimes', 'in:unpaid,paid,overdue,cancelled'],
            'paid_at'  => ['sometimes', 'nullable', 'date'],
        ];
    }
}
