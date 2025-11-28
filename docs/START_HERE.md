# 🎯 Development Flow - Quick Reference

> Panduan cepat: Mulai dari mana dan ke mana

---

## 📍 **YOU ARE HERE**

```
✅ Database Setup (DONE)
    ↓
🔄 Models & Seeders (NOW) ← START HERE!
    ↓
⏳ Controllers & API (NEXT)
    ↓
⏳ Frontend Pages (AFTER)
    ↓
⏳ Testing & Deploy (FINAL)
```

---

## 🚀 **Start Here: 5 Steps to Get Going**

### **Step 1: Create Your First Model** (15 minutes)

```bash
# Create Client model
php artisan make:model Client
```

**Edit `app/Models/Client.php`:**
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

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
```

**Test it:**
```bash
php artisan tinker
>>> $client = new App\Models\Client();
>>> $client->fillable
```

---

### **Step 2: Create Seeder** (10 minutes)

```bash
php artisan make:seeder ClientSeeder
```

**Edit `database/seeders/ClientSeeder.php`:**
```php
<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        Client::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone_number' => '081234567890',
            'type' => 'individual',
            'status' => 'active',
        ]);

        Client::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'phone_number' => '081234567891',
            'company_name' => 'ABC Corp',
            'type' => 'company',
            'status' => 'active',
        ]);
    }
}
```

**Run it:**
```bash
php artisan db:seed --class=ClientSeeder
```

**Verify:**
```bash
php artisan tinker
>>> App\Models\Client::all()
```

---

### **Step 3: Create More Models** (1 hour)

**In this order:**

```bash
# 1. Service
php artisan make:model Service

# 2. Order
php artisan make:model Order

# 3. Invoice
php artisan make:model Invoice

# 4. Payment
php artisan make:model Payment

# 5. OrderItem
php artisan make:model OrderItem
```

**For each model:**
1. Add `$fillable` fields (check `docs/DATABASE_SCHEMA_V2.md`)
2. Add `$casts` for JSON/dates
3. Add relationships
4. Test in tinker

---

### **Step 4: Create Controller** (30 minutes)

```bash
# Create API controller
php artisan make:controller Api/OrderController --api

# Create request validator
php artisan make:request StoreOrderRequest

# Create resource
php artisan make:resource OrderResource
```

**Add routes in `routes/api.php`:**
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('orders', OrderController::class);
});
```

**Test:**
```bash
php artisan route:list --path=api/orders
```

---

### **Step 5: Test API** (15 minutes)

**Using Postman/Insomnia:**

1. **GET** `http://127.0.0.1:8000/api/orders`
2. **POST** `http://127.0.0.1:8000/api/orders`
   ```json
   {
     "client_id": "uuid-here",
     "items": [
       {
         "service_id": "uuid-here",
         "quantity": 1,
         "price": 5000000
       }
     ]
   }
   ```

---

## 📋 **Complete Checklist**

### **Week 1: Foundation**

- [ ] Create all models (17 models)
  - [ ] Client
  - [ ] Service
  - [ ] Order
  - [ ] Invoice
  - [ ] Payment
  - [ ] OrderItem
  - [ ] Post
  - [ ] PortfolioProject
  - [ ] Testimonial
  - [ ] Tag
  - [ ] Quotation
  - [ ] QuotationItem
  - [ ] ActivityLog
  - [ ] Notification (use Laravel's)
  - [ ] Media
  - [ ] OrderStatusHistory
  - [ ] Taggable (pivot, no model needed)

- [ ] Create seeders
  - [ ] UserSeeder
  - [ ] ClientSeeder
  - [ ] ServiceSeeder
  - [ ] TagSeeder

- [ ] Test relationships
  - [ ] Client → Orders
  - [ ] Order → Items
  - [ ] Order → Invoice
  - [ ] Invoice → Payments

### **Week 2: Core API**

- [ ] Authentication
  - [ ] Login endpoint
  - [ ] Register endpoint
  - [ ] Logout endpoint

- [ ] Order Management
  - [ ] List orders
  - [ ] Create order
  - [ ] Update order
  - [ ] Delete order
  - [ ] Update status

- [ ] Invoice Management
  - [ ] Generate invoice
  - [ ] List invoices
  - [ ] Send invoice email

### **Week 3-4: Frontend**

- [ ] Dashboard page
- [ ] Orders page
- [ ] Clients page
- [ ] Invoices page
- [ ] Settings page

### **Week 5-6: Advanced**

- [ ] Quotation system
- [ ] Payment integration
- [ ] Notifications
- [ ] Reports

### **Week 7-8: Polish**

- [ ] Testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation

### **Week 9-10: Deploy**

- [ ] Server setup
- [ ] Deploy to production
- [ ] Monitoring
- [ ] Backup

---

## 🎓 **Learning Path**

### **If you're new to Laravel:**

1. **Day 1-2:** Learn Laravel basics
   - Routes
   - Controllers
   - Models
   - Migrations

2. **Day 3-4:** Learn Eloquent
   - Relationships
   - Query builder
   - Accessors/Mutators

3. **Day 5-7:** Learn API development
   - Resources
   - Requests
   - Authentication

4. **Week 2:** Learn Inertia.js + React
   - Pages
   - Components
   - Forms

### **If you're experienced:**

**Week 1:** Complete all models and seeders  
**Week 2:** Complete all API endpoints  
**Week 3-4:** Complete all frontend pages  
**Week 5:** Testing and deployment

---

## 🛠️ **Daily Workflow**

### **Morning (2-3 hours)**

1. Check yesterday's progress
2. Pick next task from checklist
3. Code the feature
4. Test in tinker/Postman

### **Afternoon (2-3 hours)**

1. Continue coding
2. Write tests
3. Update documentation
4. Commit changes

### **Evening (1 hour)**

1. Review code
2. Plan tomorrow
3. Update checklist

---

## 📊 **Progress Tracking**

Create a simple tracker:

```
Week 1: Foundation
[████████░░] 80% - Models done, seeders in progress

Week 2: Core API
[░░░░░░░░░░] 0% - Not started

Week 3-4: Frontend
[░░░░░░░░░░] 0% - Not started
```

---

## 🎯 **Today's Goal**

**Complete these 3 tasks:**

1. ✅ Create Client model with relationships
2. ✅ Create ClientSeeder with sample data
3. ✅ Test in tinker

**Time needed:** ~1 hour

---

## 🆘 **Quick Help**

### **Common Commands**

```bash
# Create model
php artisan make:model ModelName

# Create controller
php artisan make:controller ControllerName

# Create seeder
php artisan make:seeder SeederName

# Run seeder
php artisan db:seed --class=SeederName

# Test in tinker
php artisan tinker

# Check routes
php artisan route:list

# Clear cache
php artisan optimize:clear
```

### **Common Issues**

**Model not found:**
```bash
composer dump-autoload
```

**Seeder not working:**
```bash
php artisan db:seed --class=SeederName --verbose
```

**Relationship not loading:**
```php
// Use eager loading
Order::with('client')->get();
```

---

## 📚 **Resources**

- **Full Roadmap:** `docs/ROADMAP.md`
- **Database Schema:** `docs/DATABASE_SCHEMA_V2.md`
- **API Docs:** `docs/API_DOCUMENTATION.md`
- **Quick Start:** `docs/QUICK_START.md`

---

**Ready? Start with Step 1: Create Client Model!** 🚀

**Estimated time to first working feature:** 1 week  
**Estimated time to MVP:** 4-6 weeks  
**Estimated time to production:** 10-12 weeks
