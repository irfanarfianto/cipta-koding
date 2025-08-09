<?php

namespace App\Http\Requests\Admin\Tag;

use Illuminate\Foundation\Http\FormRequest;

class TagStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'name' => ['required','string','max:100','unique:tags,name'],
            'slug' => ['nullable','string','max:120','unique:tags,slug'],
        ];
    }
}
