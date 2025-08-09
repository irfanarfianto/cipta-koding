<?php

namespace App\Http\Requests\Admin\Portfolio;

use Illuminate\Foundation\Http\FormRequest;

class PortfolioStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return $this->user()?->isAdmin() === true; }

    public function rules(): array
    {
        return [
            'title'           => ['required','string','max:200'],
            'slug'            => ['nullable','string','max:220','unique:portfolio_projects,slug'],
            'description'     => ['required','string'],
            'project_url'     => ['nullable','url','max:255'],
            'cover_image_url' => ['nullable','url','max:255'],
            'completed_date'  => ['nullable','date'],
            'client_id'       => ['nullable','uuid','exists:clients,id'],
            'client_name'     => ['nullable','string','max:150'],
            'tag_ids'         => ['array'],
            'tag_ids.*'       => ['uuid','exists:tags,id'],
        ];
    }
}
