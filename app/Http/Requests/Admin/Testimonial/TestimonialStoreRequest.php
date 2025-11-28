<?php

namespace App\Http\Requests\Admin\Testimonial;

use Illuminate\Foundation\Http\FormRequest;

class TestimonialStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
   public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'client_name'     => ['required_without:client_id','string','max:150'],
            'client_position' => ['nullable','string','max:150'],
            'client_id'       => ['nullable','uuid','exists:clients,id'],
            'content'         => ['required','string'],
            'is_featured'     => ['boolean'],
        ];
    }
}
