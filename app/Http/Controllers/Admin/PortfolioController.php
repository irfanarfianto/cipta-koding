<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Portfolio\PortfolioStoreRequest;
use App\Http\Requests\Admin\Portfolio\PortfolioUpdateRequest;
use App\Models\Client;
use App\Models\PortfolioProject;
use App\Models\Tag;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index()
    {
        $projects = PortfolioProject::query()
            ->with('client')
            ->when(request('search'), fn($q)=>$q->where('title','like','%'.request('search').'%'))
            ->orderByDesc('completed_date')
            ->paginate(10)->withQueryString();

        return Inertia::render('Admin/Portfolio/Index', [
            'projects'=>$projects,
            'filters'=>request()->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Portfolio/Create', [
            'tags'    => Tag::orderBy('name')->get(['id','name']),
            'clients' => Client::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(PortfolioStoreRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']).'-'.Str::random(5);

        $tags = $data['tag_ids'] ?? [];
        unset($data['tag_ids']);

        $project = PortfolioProject::create($data);
        if ($tags) $project->tags()->sync($tags);

        return redirect()->route('admin.portfolio.index')->with('success','Proyek portofolio dibuat.');
    }

    public function edit(PortfolioProject $portfolio)
    {
        return Inertia::render('Admin/Portfolio/Edit', [
            'project' => $portfolio->load('tags'),
            'tags'    => Tag::orderBy('name')->get(['id','name']),
            'clients' => Client::orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(PortfolioUpdateRequest $request, PortfolioProject $portfolio)
    {
        $data = $request->validated();
        $tags = $data['tag_ids'] ?? null;
        unset($data['tag_ids']);

        $portfolio->update($data);
        if (!is_null($tags)) $portfolio->tags()->sync($tags);

        return back()->with('success','Proyek portofolio diperbarui.');
    }

    public function destroy(PortfolioProject $portfolio)
    {
        $portfolio->delete();
        return redirect()->route('admin.portfolio.index')->with('success','Proyek portofolio dihapus.');
    }
}
