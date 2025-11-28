<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Testimonial\TestimonialStoreRequest;
use App\Http\Requests\Admin\Testimonial\TestimonialUpdateRequest;
use App\Models\Client;
use App\Models\Testimonial;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::query()
            ->when(!is_null(request('featured')), fn($q)=>$q->where('is_featured', (bool)request('featured')))
            ->orderByDesc('created_at')
            ->paginate(10)->withQueryString();

        return Inertia::render('Admin/Testimonials/Index', [
            'testimonials'=>$testimonials,
            'filters'=>request()->only('featured'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Testimonials/Create', [
            'clients' => Client::orderBy('name')->get(['id','name']),
        ]);
    }

    public function store(TestimonialStoreRequest $request)
    {
        Testimonial::create($request->validated());
        return redirect()->route('admin.testimonials.index')->with('success','Testimoni dibuat.');
    }

    public function edit(Testimonial $testimonial)
    {
        return Inertia::render('Admin/Testimonials/Edit', [
            'testimonial'=>$testimonial,
            'clients'=>Client::orderBy('name')->get(['id','name']),
        ]);
    }

    public function update(TestimonialUpdateRequest $request, Testimonial $testimonial)
    {
        $testimonial->update($request->validated());
        return back()->with('success','Testimoni diperbarui.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        return redirect()->route('admin.testimonials.index')->with('success','Testimoni dihapus.');
    }
}
