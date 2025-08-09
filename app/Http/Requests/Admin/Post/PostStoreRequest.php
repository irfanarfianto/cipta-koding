<?php

namespace App\Http\Requests\Admin\Post;

use Illuminate\Foundation\Http\FormRequest;

class PostStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'title'           => ['required','string','max:200'],
            'slug'            => ['nullable','string','max:220','unique:posts,slug'],
            'excerpt'         => ['nullable','string'],
            'body'            => ['required','string'],
            'cover_image_url' => ['nullable','url','max:255'],
            'status'          => ['required','in:draft,published'],
            'published_at'    => ['nullable','date'],
            'tag_ids'         => ['array'],
            'tag_ids.*'       => ['uuid','exists:tags,id'],
        ];
    }
}
