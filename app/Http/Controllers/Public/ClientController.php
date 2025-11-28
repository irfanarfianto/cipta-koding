<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = Client::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        $clients = $query->withCount('orders')
            ->latest()
            ->paginate(15);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['status', 'type', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new client.
     */
    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone_number' => 'required|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'company_website' => 'nullable|url',
            'type' => 'required|in:individual,company',
            'status' => 'nullable|in:active,inactive,blocked',
            'referred_by' => 'nullable|uuid|exists:clients,id',
            'metadata' => 'nullable|array',
        ]);

        // Generate referral code
        $validated['referral_code'] = strtoupper(substr(md5($validated['email']), 0, 10));
        $validated['status'] = $validated['status'] ?? 'active';

        $client = Client::create($validated);

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client berhasil ditambahkan!');
    }

    /**
     * Display the specified client.
     */
    public function show(Client $client)
    {
        $client->load([
            'orders' => fn($q) => $q->latest()->take(10),
            'testimonials',
            'portfolioProjects',
            'referrer',
            'referrals',
        ]);

        return Inertia::render('Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified client.
     */
    public function edit(Client $client)
    {
        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'availableReferrers' => Client::where('id', '!=', $client->id)
                ->where('status', 'active')
                ->get(['id', 'name', 'email']),
        ]);
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $client->id,
            'phone_number' => 'required|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'company_website' => 'nullable|url',
            'type' => 'required|in:individual,company',
            'status' => 'required|in:active,inactive,blocked',
            'referred_by' => 'nullable|uuid|exists:clients,id',
            'metadata' => 'nullable|array',
        ]);

        $client->update($validated);

        return redirect()->route('clients.show', $client)
            ->with('success', 'Client berhasil diupdate!');
    }

    /**
     * Remove the specified client.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client berhasil dihapus!');
    }
}
