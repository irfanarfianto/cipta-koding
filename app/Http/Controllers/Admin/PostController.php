<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Post\PostStoreRequest;
use App\Http\Requests\Admin\Post\PostUpdateRequest;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::query()
            ->with('author')
            ->when(request('status'), fn($q)=>$q->where('status',request('status')))
            ->when(request('search'), fn($q)=>$q->where('title','like','%'.request('search').'%'))
            ->orderByDesc('published_at')
            ->paginate(10)->withQueryString();

        return Inertia::render('Admin/Posts/Index', [
            'posts'=>$posts,
            'filters'=>request()->only(['status','search']),
            'statuses'=>['draft','published'],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Posts/Create', [
            'tags' => Tag::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(PostStoreRequest $request)
    {
        $data = $request->validated();
        $data['slug']    = $data['slug'] ?? Str::slug($data['title']).'-'.Str::random(5);
        $data['user_id'] = auth()->id();

        $tags = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $post = Post::create($data);
        if ($tags) $post->tags()->sync($tags);

        return redirect()->route('admin.posts.index')->with('success','Post dibuat.');
    }

    public function edit(Post $post)
    {
        return Inertia::render('Admin/Posts/Edit', [
            'post' => $post->load('tags'),
            'tags' => Tag::orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(PostUpdateRequest $request, Post $post)
    {
        $data = $request->validated();

        $tags = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $post->update($data);
        if (!is_null($tags)) $post->tags()->sync($tags);

        return back()->with('success','Post diperbarui.');
    }

    public function destroy(Post $post)
    {
        $post->delete();
        return redirect()->route('admin.posts.index')->with('success','Post dihapus.');
    }
}
