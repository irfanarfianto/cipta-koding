<?php

namespace App\Http\Requests\Admin\Tag;

use Illuminate\Foundation\Http\FormRequest;

class TagUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        $id = $this->route('tag')->id;
        return [
            'name' => ['required','string','max:100',"unique:tags,name,{$id},id"],
            'slug' => ['required','string','max:120',"unique:tags,slug,{$id},id"],
        ];
    }
}
