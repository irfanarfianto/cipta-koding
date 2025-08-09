<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Client\ClientStoreRequest;
use App\Http\Requests\Admin\Client\ClientUpdateRequest;
use App\Models\Client;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

        $clients = Client::query()
            ->when(request('search'), function($q) use ($like) {
                $s = request('search');
                $q->where('name',$like,"%$s%")->orWhere('email',$like,"%$s%");
            })
            ->orderBy('name')
            ->paginate(10)->withQueryString();

        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
            'filters' => request()->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Clients/Create');
    }

    public function store(ClientStoreRequest $request)
    {
        Client::create($request->validated());
        return redirect()->route('admin.clients.index')->with('success','Client dibuat.');
    }

    public function show(Client $client)
    {
        $client->loadCount('orders');
        return Inertia::render('Admin/Clients/Show', ['client'=>$client]);
    }

    public function edit(Client $client)
    {
        return Inertia::render('Admin/Clients/Edit', ['client'=>$client]);
    }

    public function update(ClientUpdateRequest $request, Client $client)
    {
        $client->update($request->validated());
        return back()->with('success','Client diperbarui.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('admin.clients.index')->with('success','Client dihapus.');
    }
}
