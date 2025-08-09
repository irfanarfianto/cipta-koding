<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Service\ServiceStoreRequest;
use App\Http\Requests\Admin\Service\ServiceUpdateRequest;
use App\Models\Service;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::query()
            ->when(request('search'), fn($q)=>$q->where('name','like','%'.request('search').'%'))
            ->orderBy('name')
            ->paginate(10)->withQueryString();

        return Inertia::render('Admin/Services/Index', [
            'services'=>$services,
            'filters'=>request()->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Services/Create');
    }

    public function store(ServiceStoreRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']).'-'.Str::random(5);

        Service::create($data);
        return redirect()->route('admin.services.index')->with('success','Service dibuat.');
    }

    public function edit(Service $service)
    {
        return Inertia::render('Admin/Services/Edit', ['service'=>$service]);
    }

    public function update(ServiceUpdateRequest $request, Service $service)
    {
        $service->update($request->validated());
        return back()->with('success','Service diperbarui.');
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return redirect()->route('admin.services.index')->with('success','Service dihapus.');
    }
}
