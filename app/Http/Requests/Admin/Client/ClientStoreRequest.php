<?php

namespace App\Http\Requests\Admin\Client;

use Illuminate\Foundation\Http\FormRequest;

class ClientStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
     public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'name'         => ['required','string','max:120'],
            'email'        => ['required','email','unique:clients,email'],
            'phone_number' => ['nullable','string','max:20'],
            'company_name' => ['nullable','string','max:120'],
            'company_website'=> ['nullable','url','max:255'],
            'address'      => ['nullable','string'],
            'status'       => ['nullable','string','in:active,inactive'],
            'metadata'     => ['nullable','array'],
        ];
    }
}
