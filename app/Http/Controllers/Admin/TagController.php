<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tag\TagStoreRequest;
use App\Http\Requests\Admin\Tag\TagUpdateRequest;
use App\Models\Tag;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TagController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Tags/Index', [
            'tags' => Tag::orderBy('name')->paginate(20),
        ]);
    }

    public function store(TagStoreRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        Tag::create($data);

        return back()->with('success','Tag dibuat.');
    }

    public function update(TagUpdateRequest $request, Tag $tag)
    {
        $tag->update($request->validated());
        return back()->with('success','Tag diperbarui.');
    }

    public function destroy(Tag $tag)
    {
        $tag->delete();
        return back()->with('success','Tag dihapus.');
    }
}
