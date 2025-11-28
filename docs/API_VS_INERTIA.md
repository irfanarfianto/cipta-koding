# 🎯 API vs Inertia Controllers - Penjelasan Lengkap

> Kapan pakai API, kapan pakai Inertia? Ini jawabannya!

**Date:** November 28, 2025

---

## 🤔 **Pertanyaan Penting**

**"Gunanya API untuk apa? Kan ini Laravel jadi monolit gabungan backend sama frontend?"**

**Jawaban:** Anda BENAR! Untuk Inertia.js, **TIDAK PERLU API routes**!

---

## 📊 **Perbedaan Arsitektur**

### **1. Inertia.js (Monolit) - Yang Kita Pakai**

```
Browser ←→ Laravel (Web Routes) ←→ Inertia ←→ React Components
         (Session Auth)          (Props)
```

**Karakteristik:**
- ✅ Satu aplikasi (backend + frontend)
- ✅ Session-based authentication
- ✅ Server-side rendering
- ✅ Return Inertia responses (bukan JSON)
- ✅ Lebih simple, lebih cepat develop

**Controller:**
```php
// ✅ BENAR untuk Inertia
public function index()
{
    return Inertia::render('Orders/Index', [
        'orders' => Order::with('client')->get()
    ]);
}
```

---

### **2. API (Terpisah) - TIDAK untuk Frontend Utama**

```
Mobile App ←→ API (JSON) ←→ Laravel
External  ←→ API (JSON) ←→ Laravel
```

**Karakteristik:**
- ❌ TIDAK untuk frontend Inertia
- ✅ Untuk mobile app
- ✅ Untuk third-party integration
- ✅ Token-based authentication (Sanctum)
- ✅ Return JSON responses

**Controller:**
```php
// ❌ SALAH untuk Inertia (tapi benar untuk API)
public function index()
{
    return OrderResource::collection(
        Order::with('client')->get()
    );
}
```

---

## ✅ **Yang BENAR untuk Project Ini**

### **Struktur yang Tepat:**

```
routes/
├── web.php          ← Inertia routes (UTAMA)
├── api.php          ← API routes (OPSIONAL, untuk mobile/external)
└── admin.php        ← Admin routes (bagian dari web)

Controllers/
├── OrderController.php        ← Inertia (return Inertia::render)
├── InvoiceController.php      ← Inertia (return Inertia::render)
└── Api/
    ├── OrderController.php    ← API (return JSON) - OPSIONAL
    └── InvoiceController.php  ← API (return JSON) - OPSIONAL
```

---

## 📝 **Contoh Implementasi**

### **✅ Inertia Controller (Yang Benar)**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{
    // List orders
    public function index()
    {
        return Inertia::render('Orders/Index', [
            'orders' => Order::with('client')->latest()->paginate(15)
        ]);
    }

    // Show create form
    public function create()
    {
        return Inertia::render('Orders/Create', [
            'clients' => Client::all(),
            'services' => Service::all(),
        ]);
    }

    // Store order
    public function store(Request $request)
    {
        $order = Order::create($request->validated());
        
        return redirect()->route('orders.show', $order)
            ->with('success', 'Order created!');
    }

    // Show order detail
    public function show(Order $order)
    {
        return Inertia::render('Orders/Show', [
            'order' => $order->load('client', 'items')
        ]);
    }
}
```

**Routes (web.php):**
```php
Route::middleware('auth')->group(function () {
    Route::resource('orders', OrderController::class);
});
```

**Frontend (React):**
```tsx
// resources/js/Pages/Orders/Index.tsx
import { Link } from '@inertiajs/react';

export default function OrdersIndex({ orders }) {
    return (
        <div>
            <h1>Orders</h1>
            {orders.data.map(order => (
                <div key={order.id}>
                    <Link href={`/orders/${order.id}`}>
                        {order.order_code}
                    </Link>
                </div>
            ))}
        </div>
    );
}
```

---

### **❌ API Controller (TIDAK Perlu untuk Inertia)**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        // Return JSON - TIDAK PERLU untuk Inertia!
        return OrderResource::collection(
            Order::with('client')->get()
        );
    }
}
```

---

## 🎯 **Kapan Pakai API?**

### **Pakai API HANYA jika:**

1. ✅ **Mobile App**
   ```
   Flutter/React Native App → API → Laravel
   ```

2. ✅ **External Integration**
   ```
   Partner System → API → Laravel
   ```

3. ✅ **Webhook**
   ```
   Payment Gateway → API → Laravel
   ```

4. ✅ **Public API**
   ```
   Third-party Developers → API → Laravel
   ```

### **JANGAN Pakai API untuk:**

❌ Frontend Inertia.js (gunakan Inertia Controller)  
❌ Internal admin panel (gunakan Inertia Controller)  
❌ User dashboard (gunakan Inertia Controller)

---

## 🔄 **Refactoring yang Sudah Dilakukan**

### **Before (Salah):**
```
✗ Api/OrderController.php (return JSON)
✗ routes/api.php (API routes)
✗ OrderResource.php (JSON transformation)
```

### **After (Benar):**
```
✓ OrderController.php (return Inertia)
✓ routes/web.php (Web routes)
✓ Direct data passing ke React
```

---

## 📁 **Struktur File yang Benar**

```
app/Http/Controllers/
├── OrderController.php           ✅ Inertia
├── InvoiceController.php         ✅ Inertia
├── ClientController.php          ✅ Inertia
├── ServiceController.php         ✅ Inertia
└── Api/                          ⚠️ OPSIONAL (hanya jika perlu)
    ├── OrderController.php       (untuk mobile app)
    └── InvoiceController.php     (untuk mobile app)

routes/
├── web.php                       ✅ UTAMA
├── api.php                       ⚠️ OPSIONAL
└── admin.php                     ✅ Bagian dari web

resources/js/Pages/
├── Orders/
│   ├── Index.tsx                 ✅ List orders
│   ├── Create.tsx                ✅ Create form
│   ├── Show.tsx                  ✅ Detail
│   └── Edit.tsx                  ✅ Edit form
└── ...
```

---

## 💡 **Best Practices**

### **1. Untuk Inertia.js:**

```php
// ✅ DO: Return Inertia
return Inertia::render('Orders/Index', [
    'orders' => $orders
]);

// ✅ DO: Redirect with flash message
return redirect()->route('orders.index')
    ->with('success', 'Order created!');

// ❌ DON'T: Return JSON
return response()->json(['orders' => $orders]);
```

### **2. Data Passing:**

```php
// ✅ DO: Pass data langsung
return Inertia::render('Orders/Index', [
    'orders' => Order::with('client')->get(),
    'filters' => $request->only(['status']),
]);

// ❌ DON'T: Pakai Resource untuk Inertia
return Inertia::render('Orders/Index', [
    'orders' => OrderResource::collection($orders) // Tidak perlu!
]);
```

### **3. Form Handling:**

```php
// ✅ DO: Validate dan redirect
public function store(Request $request)
{
    $validated = $request->validate([...]);
    $order = Order::create($validated);
    
    return redirect()->route('orders.show', $order)
        ->with('success', 'Created!');
}

// ❌ DON'T: Return JSON
public function store(Request $request)
{
    $order = Order::create($request->all());
    return response()->json($order); // Salah!
}
```

---

## 🚀 **Next Steps**

### **Yang Perlu Dilakukan:**

1. ✅ **Gunakan Inertia Controllers** (sudah dibuat)
2. ✅ **Gunakan Web Routes** (sudah diupdate)
3. ⏳ **Buat React Pages** (Orders/Index, Create, Show, Edit)
4. ⏳ **Hapus API routes** (jika tidak perlu mobile app)

### **Jika Nanti Perlu Mobile App:**

1. Buat `Api/OrderController` terpisah
2. Return JSON dengan `OrderResource`
3. Gunakan Sanctum untuk authentication
4. Dokumentasi API dengan Postman

---

## 📊 **Comparison Table**

| Aspek | Inertia Controller | API Controller |
|-------|-------------------|----------------|
| **Return** | `Inertia::render()` | `response()->json()` |
| **Routes** | `routes/web.php` | `routes/api.php` |
| **Auth** | Session | Token (Sanctum) |
| **Response** | HTML + Props | JSON |
| **Untuk** | Web Frontend | Mobile/External |
| **Redirect** | ✅ Yes | ❌ No |
| **Flash Messages** | ✅ Yes | ❌ No |
| **Validation** | Form Request | Form Request |

---

## ✅ **Kesimpulan**

### **Untuk Project Cipta Koding:**

1. ✅ **Gunakan Inertia Controllers** untuk semua fitur web
2. ✅ **Gunakan Web Routes** (`routes/web.php`)
3. ✅ **Pass data langsung** ke React components
4. ⚠️ **API routes OPSIONAL** (hanya jika nanti ada mobile app)

### **Keuntungan Inertia:**

- ✅ Lebih simple (tidak perlu API layer)
- ✅ Lebih cepat develop
- ✅ Session auth (lebih aman)
- ✅ Flash messages built-in
- ✅ Form validation terintegrasi
- ✅ SEO friendly

---

**Jadi:** API yang sudah dibuat tadi **TIDAK PERLU** untuk frontend Inertia.js!  
**Gunakan:** Inertia Controller yang baru saja dibuat! ✅

**Documentation:** Lihat `OrderController.php` untuk contoh lengkap.

---

**Status:** ✅ **REFACTORED**  
**Next:** Buat React Pages untuk Orders  
**Time:** ~10 menit untuk refactor
