<?php

namespace App\Http\Requests\Admin\Service;

use Illuminate\Foundation\Http\FormRequest;

class ServiceStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'name'        => ['required','string','max:150'],
            'slug'        => ['nullable','string','max:180','unique:services,slug'],
            'description' => ['required','string'],
            'base_price'  => ['nullable','numeric','min:0'],
            'is_active'   => ['boolean'],
        ];
    }
}
