<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index(Request $request)
    {
        $query = Service::query();

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $services = $query->orderBy('display_order')
            ->latest()
            ->paginate(15);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'filters' => $request->only(['category', 'is_active', 'search']),
            'categories' => Service::distinct()->pluck('category')->filter(),
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create()
    {
        return Inertia::render('Services/Create', [
            'tags' => Tag::all(),
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:services,slug',
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:100',
            'estimated_days' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'pricing_tiers' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'tags' => 'nullable|array',
        ]);

        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['is_active'] = $validated['is_active'] ?? true;

        $service = Service::create($validated);

        // Attach tags
        if (!empty($validated['tags'])) {
            $service->tags()->sync($validated['tags']);
        }

        return redirect()->route('services.show', $service)
            ->with('success', 'Service berhasil ditambahkan!');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        $service->load('tags');

        return Inertia::render('Services/Show', [
            'service' => $service,
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        $service->load('tags');

        return Inertia::render('Services/Edit', [
            'service' => $service,
            'tags' => Tag::all(),
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:services,slug,' . $service->id,
            'description' => 'required|string',
            'base_price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:100',
            'estimated_days' => 'nullable|integer|min:1',
            'features' => 'nullable|array',
            'pricing_tiers' => 'nullable|array',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'tags' => 'nullable|array',
        ]);

        $service->update($validated);

        // Sync tags
        if (isset($validated['tags'])) {
            $service->tags()->sync($validated['tags']);
        }

        return redirect()->route('services.show', $service)
            ->with('success', 'Service berhasil diupdate!');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('services.index')
            ->with('success', 'Service berhasil dihapus!');
    }
}
