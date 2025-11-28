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
            'github_url'      => ['nullable','url','max:255'],
            'cover_image_url' => ['nullable','url','max:255'],
            'images'          => ['nullable','array'],
            'tech_stack'      => ['nullable','array'],
            'completed_date'  => ['nullable','date'],
            'duration_days'   => ['nullable','integer','min:1'],
            'team_size'       => ['nullable','integer','min:1'],
            'client_id'       => ['nullable','uuid','exists:clients,id'],
            'client_name'     => ['nullable','string','max:150'],
            'meta_title'      => ['nullable','string','max:255'],
            'meta_description'=> ['nullable','string'],
            'is_featured'     => ['boolean'],
            'tag_ids'         => ['array'],
            'tag_ids.*'       => ['uuid','exists:tags,id'],
        ];
    }
}
