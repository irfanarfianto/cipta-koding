# 🗺️ Development Roadmap

> Panduan step-by-step development Cipta Koding Platform dari awal sampai deployment

**Last Updated:** November 28, 2025

---

## 📋 Table of Contents

- [Phase 1: Foundation](#phase-1-foundation-week-1-2)
- [Phase 2: Core Features](#phase-2-core-features-week-3-6)
- [Phase 3: Advanced Features](#phase-3-advanced-features-week-7-10)
- [Phase 4: Polish & Deploy](#phase-4-polish--deploy-week-11-12)

---

## 🎯 Development Flow Overview

```
Setup → Models → Controllers → API → Frontend → Testing → Deploy
  ↓        ↓          ↓         ↓        ↓          ↓         ↓
 ✅      [NOW]      [NEXT]   [NEXT]   [NEXT]    [NEXT]    [FINAL]
```

---

## Phase 1: Foundation (Week 1-2)

### ✅ **DONE - Database Setup**

- [x] Database migration created
- [x] 17 tables with all improvements
- [x] Indexes and constraints
- [x] Documentation complete

### 🔄 **IN PROGRESS - Models & Relationships**

#### **Step 1.1: Create Base Models** (Day 1-2)

**Priority Order:**

1. **User Model** (Already exists)
   ```bash
   # Check existing model
   cat app/Models/User.php
   ```

2. **Client Model**
   ```bash
   php artisan make:model Client
   ```

3. **Service Model**
   ```bash
   php artisan make:model Service
   ```

4. **Order Model**
   ```bash
   php artisan make:model Order
   ```

5. **Invoice Model**
   ```bash
   php artisan make:model Invoice
   ```

**What to do:**
- Define `$fillable` fields
- Add `$casts` for JSON and dates
- Define relationships
- Add accessors/mutators if needed

**Example - Client Model:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Client extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone_number', 'address',
        'company_name', 'company_website', 'type', 'status',
        'referred_by', 'referral_code', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function referrer()
    {
        return $this->belongsTo(Client::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Client::class, 'referred_by');
    }
}
```

**Checklist:**
- [ ] Create all 17 models
- [ ] Define fillable fields
- [ ] Add casts
- [ ] Define relationships
- [ ] Test relationships in tinker

---

#### **Step 1.2: Create Seeders** (Day 3-4)

**Priority Order:**

1. **UserSeeder**
   ```bash
   php artisan make:seeder UserSeeder
   ```

2. **ClientSeeder**
   ```bash
   php artisan make:seeder ClientSeeder
   ```

3. **ServiceSeeder**
   ```bash
   php artisan make:seeder ServiceSeeder
   ```

**Example - ServiceSeeder:**
```php
<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Website Development',
                'slug' => 'website-development',
                'description' => 'Custom website development',
                'category' => 'web',
                'base_price' => 5000000,
                'estimated_days' => 30,
                'is_active' => true,
            ],
            // Add more services...
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
```

**Checklist:**
- [ ] Create seeders for all models
- [ ] Add realistic sample data
- [ ] Run seeders: `php artisan db:seed`
- [ ] Verify data in database

---

#### **Step 1.3: Create Factories** (Day 5)

```bash
php artisan make:factory ClientFactory
php artisan make:factory ServiceFactory
php artisan make:factory OrderFactory
```

**Example - ClientFactory:**
```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone_number' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'company_name' => fake()->company(),
            'type' => fake()->randomElement(['individual', 'company']),
            'status' => 'active',
        ];
    }
}
```

**Checklist:**
- [ ] Create factories for main models
- [ ] Test factories in tinker
- [ ] Use in tests

---

## Phase 2: Core Features (Week 3-6)

### 📝 **Step 2.1: Authentication & Authorization** (Week 3)

#### **Day 1-2: Setup Authentication**

```bash
# Install Laravel Breeze or Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

**Checklist:**
- [ ] Setup Sanctum
- [ ] Create auth controllers
- [ ] Add login/register endpoints
- [ ] Test authentication

#### **Day 3-5: Authorization**

```bash
# Create policies
php artisan make:policy OrderPolicy --model=Order
php artisan make:policy InvoicePolicy --model=Invoice
```

**Checklist:**
- [ ] Create policies for each model
- [ ] Define authorization rules
- [ ] Add middleware to routes
- [ ] Test permissions

---

### 🛍️ **Step 2.2: Order Management** (Week 4)

#### **Day 1-3: Order CRUD**

```bash
# Create controller
php artisan make:controller Api/OrderController --api

# Create request validators
php artisan make:request StoreOrderRequest
php artisan make:request UpdateOrderRequest

# Create resource
php artisan make:resource OrderResource
```

**Implementation Order:**

1. **Routes** (`routes/api.php`)
   ```php
   Route::middleware('auth:sanctum')->group(function () {
       Route::apiResource('orders', OrderController::class);
   });
   ```

2. **Controller** (`app/Http/Controllers/Api/OrderController.php`)
   ```php
   public function index()
   {
       $orders = Order::with(['client', 'items'])
           ->latest()
           ->paginate(15);
       
       return OrderResource::collection($orders);
   }

   public function store(StoreOrderRequest $request)
   {
       $order = Order::create($request->validated());
       
       // Add items
       foreach ($request->items as $item) {
           $order->items()->create($item);
       }
       
       return new OrderResource($order->load('items'));
   }
   ```

3. **Resource** (`app/Http/Resources/OrderResource.php`)
   ```php
   public function toArray($request)
   {
       return [
           'id' => $this->id,
           'order_code' => $this->order_code,
           'client' => new ClientResource($this->whenLoaded('client')),
           'status' => $this->status,
           'final_amount' => $this->final_amount,
           'items' => OrderItemResource::collection($this->whenLoaded('items')),
           'created_at' => $this->created_at,
       ];
   }
   ```

**Checklist:**
- [ ] Create all CRUD endpoints
- [ ] Add validation
- [ ] Add resources for JSON responses
- [ ] Test with Postman/Insomnia

#### **Day 4-5: Order Status Management**

```bash
php artisan make:controller Api/OrderStatusController
```

**Implementation:**
```php
public function updateStatus(Order $order, Request $request)
{
    $validated = $request->validate([
        'status' => 'required|in:' . implode(',', Order::STATUSES),
        'note' => 'nullable|string',
    ]);

    // Create status history
    $order->statusHistories()->create([
        'from_status' => $order->status,
        'to_status' => $validated['status'],
        'changed_by' => auth()->id(),
        'note' => $validated['note'] ?? null,
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
    ]);

    // Update order status
    $order->update(['status' => $validated['status']]);

    return new OrderResource($order);
}
```

**Checklist:**
- [ ] Status update endpoint
- [ ] Status history tracking
- [ ] Notifications on status change
- [ ] Test all status transitions

---

### 💰 **Step 2.3: Invoice & Payment** (Week 5)

#### **Day 1-3: Invoice Management**

```bash
php artisan make:controller Api/InvoiceController --api
php artisan make:request StoreInvoiceRequest
php artisan make:resource InvoiceResource
```

**Key Features:**
- Generate invoice from order
- Calculate tax
- Send invoice email
- PDF generation

**Checklist:**
- [ ] Invoice CRUD
- [ ] Auto-generate invoice code
- [ ] Tax calculation
- [ ] PDF generation (use DomPDF)
- [ ] Email invoice to client

#### **Day 4-5: Payment Processing**

```bash
php artisan make:controller Api/PaymentController
```

**Integration:**
- Midtrans payment gateway
- Manual payment verification
- Payment proof upload

**Checklist:**
- [ ] Payment gateway integration
- [ ] Manual payment endpoint
- [ ] Payment verification
- [ ] Update invoice status
- [ ] Send payment confirmation

---

### 📊 **Step 2.4: Dashboard & Analytics** (Week 6)

```bash
php artisan make:controller Api/DashboardController
```

**Metrics to implement:**
- Total orders (by status)
- Revenue (monthly, yearly)
- Top clients
- Popular services
- Pending invoices

**Checklist:**
- [ ] Dashboard endpoint
- [ ] Revenue analytics
- [ ] Order statistics
- [ ] Client analytics
- [ ] Chart data endpoints

---

## Phase 3: Advanced Features (Week 7-10)

### 🎯 **Step 3.1: Quotation System** (Week 7)

```bash
php artisan make:controller Api/QuotationController --api
php artisan make:model Quotation
php artisan make:model QuotationItem
```

**Features:**
- Create quotation
- Send to client
- Client accept/reject
- Convert to order

**Checklist:**
- [ ] Quotation CRUD
- [ ] Email quotation
- [ ] Accept/reject endpoints
- [ ] Convert to order
- [ ] PDF generation

---

### 🎨 **Step 3.2: Frontend Development** (Week 8-9)

#### **Day 1-5: Core Pages**

**Priority Order:**

1. **Dashboard** (`resources/js/Pages/Dashboard.tsx`)
   - Overview metrics
   - Recent orders
   - Pending invoices

2. **Orders** (`resources/js/Pages/Orders/`)
   - List orders
   - Create order
   - Order detail
   - Update status

3. **Clients** (`resources/js/Pages/Clients/`)
   - Client list
   - Client detail
   - Client orders

4. **Invoices** (`resources/js/Pages/Invoices/`)
   - Invoice list
   - Invoice detail
   - Payment form

**Checklist:**
- [ ] Create all page components
- [ ] Integrate with API
- [ ] Add loading states
- [ ] Add error handling
- [ ] Responsive design

#### **Day 6-10: Additional Features**

- [ ] Portfolio management
- [ ] Blog system
- [ ] Service catalog
- [ ] Testimonials
- [ ] Settings

---

### 🔔 **Step 3.3: Notifications** (Week 10)

```bash
php artisan make:notification OrderStatusChanged
php artisan make:notification InvoiceCreated
php artisan make:notification PaymentReceived
```

**Channels:**
- Database
- Email
- (Optional) WhatsApp

**Checklist:**
- [ ] Create all notifications
- [ ] Send on events
- [ ] Notification center UI
- [ ] Mark as read
- [ ] Email templates

---

## Phase 4: Polish & Deploy (Week 11-12)

### 🧪 **Step 4.1: Testing** (Week 11)

#### **Unit Tests**

```bash
php artisan make:test OrderTest --unit
php artisan make:test InvoiceTest --unit
```

**Checklist:**
- [ ] Model tests
- [ ] Service tests
- [ ] Helper tests

#### **Feature Tests**

```bash
php artisan make:test OrderApiTest
php artisan make:test InvoiceApiTest
```

**Checklist:**
- [ ] API endpoint tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Integration tests

---

### 🚀 **Step 4.2: Deployment** (Week 12)

#### **Day 1-2: Preparation**

**Checklist:**
- [ ] Environment variables
- [ ] Database backup
- [ ] Assets optimization
- [ ] Cache configuration
- [ ] Queue setup

#### **Day 3-4: Deploy**

```bash
# Build assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force
```

**Checklist:**
- [ ] Setup server (VPS/Cloud)
- [ ] Configure web server (Nginx/Apache)
- [ ] SSL certificate
- [ ] Deploy code
- [ ] Run migrations
- [ ] Test production

#### **Day 5: Monitoring**

**Checklist:**
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics
- [ ] Setup uptime monitoring
- [ ] Backup automation
- [ ] Performance monitoring

---

## 📊 Progress Tracking

### Current Status

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | 🔄 In Progress | 50% |
| Phase 2: Core Features | ⏳ Pending | 0% |
| Phase 3: Advanced Features | ⏳ Pending | 0% |
| Phase 4: Polish & Deploy | ⏳ Pending | 0% |

### Completed Tasks

- [x] Database schema design
- [x] Migrations created
- [x] Documentation written
- [x] Development environment setup

### Next Immediate Tasks

1. ✅ **Create Models** (Start here!)
   - Client, Service, Order, Invoice, Payment
   - Define relationships
   - Add casts

2. ✅ **Create Seeders**
   - Sample data for testing
   - Run seeders

3. ✅ **Create Controllers**
   - OrderController
   - InvoiceController
   - Start with CRUD

---

## 🎯 Quick Start (What to Do NOW)

### **Today: Create Models**

```bash
# 1. Create Client Model
php artisan make:model Client

# 2. Edit app/Models/Client.php
# - Add fillable fields
# - Add casts
# - Add relationships

# 3. Test in tinker
php artisan tinker
>>> $client = new App\Models\Client();
>>> $client->fillable
```

### **Tomorrow: Create Seeders**

```bash
# 1. Create seeder
php artisan make:seeder ClientSeeder

# 2. Add sample data
# 3. Run seeder
php artisan db:seed --class=ClientSeeder

# 4. Verify
php artisan tinker
>>> App\Models\Client::count()
```

### **This Week: Complete Phase 1**

- [ ] All models created
- [ ] All seeders created
- [ ] Sample data loaded
- [ ] Relationships tested

---

## 📚 Resources

### Documentation
- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js Docs](https://inertiajs.com)
- [React Docs](https://react.dev)

### Your Project Docs
- `docs/FEATURES.md` - Feature specifications
- `docs/DATABASE_SCHEMA_V2.md` - Database structure
- `docs/API_DOCUMENTATION.md` - API reference
- `docs/QUICK_START.md` - Setup guide

### Tools
- Postman/Insomnia - API testing
- TablePlus/DBeaver - Database GUI
- VS Code - Code editor

---

## 🆘 Need Help?

**Stuck? Check:**
1. Error logs: `storage/logs/laravel.log`
2. Database: `php artisan db:show`
3. Routes: `php artisan route:list`
4. Tinker: `php artisan tinker`

---

**Start with Phase 1, Step 1.1: Create Models!** 🚀

**Estimated Total Time:** 12 weeks (3 months)  
**Current Phase:** Foundation (Week 1-2)  
**Next Milestone:** Complete all models and seeders
