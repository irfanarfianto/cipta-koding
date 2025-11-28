<?php

namespace App\Http\Requests\Admin\Service;

use Illuminate\Foundation\Http\FormRequest;

class ServiceUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        $id = $this->route('service')->id;
        return [
            'name'        => ['required','string','max:150'],
            'slug'        => ['required','string','max:180',"unique:services,slug,{$id},id"],
            'description' => ['required','string'],
            'base_price'  => ['nullable','numeric','min:0'],
            'is_active'   => ['boolean'],
        ];
    }
}
