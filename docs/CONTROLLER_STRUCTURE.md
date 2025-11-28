# 📁 Controller Structure - Admin vs Public

> Struktur controller yang terorganisir untuk Admin Panel dan Public Frontend

**Date:** November 28, 2025  
**Status:** ✅ **ORGANIZED**

---

## 🎯 **Struktur Folder**

```
app/Http/Controllers/
├── Admin/                          ← Admin Panel (CMS)
│   ├── DashboardController.php     ✅ Dashboard admin
│   ├── OrderController.php         ✅ Manage orders (full CRUD + advanced)
│   ├── ClientController.php        ✅ Manage clients
│   ├── InvoiceController.php       ✅ Manage invoices
│   ├── ServiceController.php       ✅ Manage services
│   ├── PaymentController.php       ✅ Manage payments
│   ├── PortfolioController.php     ✅ Manage portfolio
│   ├── PostController.php          ✅ Manage blog posts
│   ├── TagController.php           ✅ Manage tags
│   └── TestimonialController.php   ✅ Manage testimonials
│
├── Public/                         ← Public Frontend (User Area)
│   ├── OrderController.php         ✅ View user orders
│   ├── ClientController.php        ✅ Client profile
│   ├── InvoiceController.php       ✅ View invoices
│   ├── ServiceController.php       ✅ Browse services
│   └── QuotationController.php     ✅ View quotations
│
├── Api/                            ← API (Optional - untuk mobile)
│   ├── OrderController.php         ⚠️ JSON responses
│   ├── InvoiceController.php       ⚠️ JSON responses
│   └── ...
│
├── Auth/                           ← Authentication
│   ├── LoginController.php
│   ├── RegisterController.php
│   └── ...
│
└── Settings/                       ← User Settings
    ├── ProfileController.php
    └── ...
```

---

## 🔐 **Perbedaan Admin vs Public**

### **Admin Controllers** (`App\Http\Controllers\Admin`)

**Untuk:** Admin/Staff yang mengelola sistem  
**Akses:** Authenticated + Admin role  
**Routes:** `/admin/*`  
**Fitur:**
- ✅ Full CRUD operations
- ✅ Bulk actions
- ✅ Export data
- ✅ Advanced filtering
- ✅ Status management
- ✅ Create invoices from orders
- ✅ Manage all data

**Contoh:**
```php
// Admin\OrderController.php
namespace App\Http\Controllers\Admin;

class OrderController extends Controller
{
    public function index() {
        // Show ALL orders from ALL clients
        return Inertia::render('Admin/Orders/Index', [
            'orders' => Order::with('client')->paginate()
        ]);
    }
    
    public function create() {
        // Create order for ANY client
    }
    
    public function bulkUpdateStatus() {
        // Update multiple orders at once
    }
    
    public function exportCsv() {
        // Export orders to CSV
    }
}
```

---

### **Public Controllers** (`App\Http\Controllers\Public`)

**Untuk:** User/Client yang melihat data mereka sendiri  
**Akses:** Authenticated user  
**Routes:** `/my/*` atau `/services`  
**Fitur:**
- ✅ View own data only
- ✅ Limited actions
- ✅ Accept/reject quotations
- ❌ No create/edit/delete
- ❌ No bulk actions

**Contoh:**
```php
// Public\OrderController.php
namespace App\Http\Controllers\Public;

class OrderController extends Controller
{
    public function index() {
        // Show ONLY current user's orders
        $clientId = auth()->user()->client_id;
        
        return Inertia::render('My/Orders/Index', [
            'orders' => Order::where('client_id', $clientId)->paginate()
        ]);
    }
    
    public function show(Order $order) {
        // Ensure user can only see their own order
        abort_unless($order->client_id === auth()->user()->client_id, 403);
        
        return Inertia::render('My/Orders/Show', [
            'order' => $order
        ]);
    }
}
```

---

## 🛣️ **Routes Structure**

### **routes/web.php**

```php
<?php

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Homepage
Route::get('/', fn() => Inertia::render('welcome'))->name('home');

// Public Services
Route::get('/services', [Public\ServiceController::class, 'index'])
    ->name('public.services.index');
Route::get('/services/{service:slug}', [Public\ServiceController::class, 'show'])
    ->name('public.services.show');

// ============================================
// AUTHENTICATED ROUTES
// ============================================

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [Admin\DashboardController::class, 'index'])
        ->name('dashboard');

    // --------------------------------------------
    // USER AREA (Public Controllers)
    // --------------------------------------------
    Route::prefix('my')->name('my.')->group(function () {
        // My Orders (read-only)
        Route::get('orders', [Public\OrderController::class, 'index'])
            ->name('orders.index');
        Route::get('orders/{order}', [Public\OrderController::class, 'show'])
            ->name('orders.show');

        // My Invoices (read-only)
        Route::get('invoices', [Public\InvoiceController::class, 'index'])
            ->name('invoices.index');
        Route::get('invoices/{invoice}', [Public\InvoiceController::class, 'show'])
            ->name('invoices.show');

        // My Quotations (can accept/reject)
        Route::get('quotations', [Public\QuotationController::class, 'index'])
            ->name('quotations.index');
        Route::get('quotations/{quotation}', [Public\QuotationController::class, 'show'])
            ->name('quotations.show');
        Route::post('quotations/{quotation}/accept', [Public\QuotationController::class, 'accept'])
            ->name('quotations.accept');
        Route::post('quotations/{quotation}/reject', [Public\QuotationController::class, 'reject'])
            ->name('quotations.reject');
    });

    // --------------------------------------------
    // ADMIN AREA (Admin Controllers)
    // --------------------------------------------
    require __DIR__ . '/admin.php';
});

// Auth routes
require __DIR__ . '/auth.php';
require __DIR__ . '/settings.php';
```

### **routes/admin.php** (Already exists)

```php
<?php

Route::prefix('admin')->name('admin.')->group(function () {
    
    // Orders Management (Full CRUD)
    Route::resource('orders', Admin\OrderController::class);
    Route::post('orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])
        ->name('orders.update-status');
    Route::post('orders/bulk/status', [Admin\OrderController::class, 'bulkUpdateStatus'])
        ->name('orders.bulk-status');
    Route::get('orders/export', [Admin\OrderController::class, 'exportCsv'])
        ->name('orders.export');
    
    // Clients Management
    Route::resource('clients', Admin\ClientController::class);
    
    // Invoices Management
    Route::resource('invoices', Admin\InvoiceController::class);
    
    // Services Management
    Route::resource('services', Admin\ServiceController::class);
    
    // ... other admin routes
});
```

---

## 📊 **Comparison Table**

| Feature | Admin Controllers | Public Controllers |
|---------|------------------|-------------------|
| **Namespace** | `App\Http\Controllers\Admin` | `App\Http\Controllers\Public` |
| **Routes** | `/admin/*` | `/my/*` or `/services` |
| **Access** | Admin only | Authenticated users |
| **Data Scope** | All data | User's own data only |
| **CRUD** | Full CRUD | Read-only (mostly) |
| **Bulk Actions** | ✅ Yes | ❌ No |
| **Export** | ✅ Yes | ❌ No |
| **Create** | ✅ Yes | ❌ No |
| **Edit** | ✅ Yes | ❌ No |
| **Delete** | ✅ Yes | ❌ No |
| **View** | ✅ All records | ✅ Own records only |

---

## 🎨 **Frontend Pages Structure**

```
resources/js/Pages/
├── Admin/                          ← Admin Panel Pages
│   ├── Dashboard.tsx
│   ├── Orders/
│   │   ├── Index.tsx              ← List all orders
│   │   ├── Create.tsx             ← Create order
│   │   ├── Show.tsx               ← Order detail
│   │   └── Edit.tsx               ← Edit order
│   ├── Clients/
│   ├── Invoices/
│   └── Services/
│
├── My/                             ← User Area Pages
│   ├── Orders/
│   │   ├── Index.tsx              ← My orders list
│   │   └── Show.tsx               ← My order detail
│   ├── Invoices/
│   │   ├── Index.tsx              ← My invoices
│   │   └── Show.tsx               ← Invoice detail
│   └── Quotations/
│       ├── Index.tsx              ← My quotations
│       └── Show.tsx               ← Quotation detail
│
└── Public/                         ← Public Pages
    ├── Services/
    │   ├── Index.tsx              ← Browse services
    │   └── Show.tsx               ← Service detail
    └── Welcome.tsx                ← Homepage
```

---

## ✅ **Implementation Checklist**

### **Structure**
- [x] Create `Admin/` folder
- [x] Create `Public/` folder
- [x] Move controllers to correct folders
- [x] Update namespaces
- [x] Update routes

### **Admin Controllers** (Already Complete)
- [x] OrderController - Full CRUD + bulk actions
- [x] ClientController - Manage clients
- [x] InvoiceController - Manage invoices
- [x] ServiceController - Manage services
- [x] PaymentController - Manage payments
- [x] PortfolioController - Manage portfolio
- [x] PostController - Manage blog
- [x] TagController - Manage tags
- [x] TestimonialController - Manage testimonials

### **Public Controllers** (New)
- [x] OrderController - View own orders
- [x] InvoiceController - View own invoices
- [x] QuotationController - View & accept/reject quotations
- [x] ServiceController - Browse services (public)
- [x] ClientController - View profile

### **Routes**
- [x] Public routes (`/services`)
- [x] User routes (`/my/*`)
- [x] Admin routes (`/admin/*`)

---

## 🚀 **Next Steps**

1. **Create Frontend Pages**
   - [ ] `resources/js/Pages/My/Orders/Index.tsx`
   - [ ] `resources/js/Pages/My/Orders/Show.tsx`
   - [ ] `resources/js/Pages/My/Invoices/Index.tsx`
   - [ ] `resources/js/Pages/Public/Services/Index.tsx`

2. **Add Authorization**
   - [ ] Ensure users can only see their own data
   - [ ] Add policies for data access
   - [ ] Middleware for admin routes

3. **Testing**
   - [ ] Test admin routes
   - [ ] Test user routes
   - [ ] Test public routes

---

## 📝 **Usage Examples**

### **Admin - Create Order**
```
URL: /admin/orders/create
Controller: Admin\OrderController@create
Access: Admin only
Can: Create order for ANY client
```

### **User - View Own Orders**
```
URL: /my/orders
Controller: Public\OrderController@index
Access: Authenticated user
Can: View ONLY their own orders
```

### **Public - Browse Services**
```
URL: /services
Controller: Public\ServiceController@index
Access: Anyone (no auth required)
Can: View all active services
```

---

**Status:** ✅ **ORGANIZED**  
**Structure:** Admin | Public | API  
**Routes:** Separated and clear  
**Next:** Create frontend pages for user area
