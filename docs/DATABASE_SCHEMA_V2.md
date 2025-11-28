# 🗄️ Database Schema Documentation (Updated)

> Dokumentasi lengkap struktur database Cipta Koding Platform dengan semua improvements

**Last Updated:** November 28, 2025  
**Version:** 2.0.0  
**Database:** PostgreSQL / MySQL

---

## 📋 Table of Contents

- [Overview](#overview)
- [Changelog](#changelog)
- [Tables Summary](#tables-summary)
- [Migration Guide](#migration-guide)

---

## 🎯 Overview

Database yang telah diperbaiki dengan fitur lengkap:
- ✅ **17 Tables** (12 existing + 5 new)
- ✅ **Enhanced Fields** untuk semua tabel existing
- ✅ **New Features** (Activity Logs, Notifications, Quotations, Media)
- ✅ **Better Indexes** untuk performance
- ✅ **Complete Soft Deletes** di semua tabel penting

### Database Statistics (Updated)
- **Total Tables:** 17 (was 12)
- **Total Relationships:** 25+
- **Polymorphic Relations:** 4
- **Soft Deletes:** 15 tables
- **UUID Primary Keys:** All tables

---

## 📝 Changelog

### Version 2.0.0 - November 28, 2025

#### ✨ New Tables
1. **activity_logs** - User activity tracking
2. **notifications** - User notifications system
3. **quotations** - Price quotations before orders
4. **quotation_items** - Items in quotations
5. **media** - Media library management

#### 🔧 Enhanced Existing Tables

**clients**
- ✅ Added `company_name`, `company_website`
- ✅ Added `type` (individual/company)
- ✅ Added `status` (active/inactive/blocked)
- ✅ Added `referred_by`, `referral_code` for referral program
- ✅ Added `metadata` JSON field

**services**
- ✅ Added `category`, `icon`
- ✅ Added `estimated_days`
- ✅ Added `features`, `pricing_tiers` (JSON)
- ✅ Added `meta_title`, `meta_description` for SEO
- ✅ Added `display_order`

**tags**
- ✅ Added `type` for categorization
- ✅ Added `color` for UI
- ✅ Added `usage_count` counter
- ✅ Added `description`

**testimonials**
- ✅ Added `rating` (1-5 stars)
- ✅ Added `company_name`, `avatar_url`
- ✅ Added `project_id` reference
- ✅ Added `display_order`

**portfolio_projects**
- ✅ Added `tech_stack`, `images` (JSON)
- ✅ Added `github_url`
- ✅ Added `duration_days`, `team_size`
- ✅ Added `is_featured`, `view_count`
- ✅ Added `meta_title`, `meta_description`

**posts**
- ✅ Added `view_count`, `reading_time`
- ✅ Added `meta_title`, `meta_description`
- ✅ Added `is_featured`, `category`

**orders**
- ✅ Added `discount_amount`, `discount_type`, `discount_code`
- ✅ Added `estimated_completion_date`
- ✅ Added `priority` (low/normal/high/urgent)
- ✅ Added `assigned_to` (user reference)
- ✅ Added status timestamps (`confirmed_at`, `started_at`, `completed_at`, `cancelled_at`)

**invoices**
- ✅ Changed `type` to required with default 'full'
- ✅ Added `tax_amount`, `tax_percentage`, `subtotal`
- ✅ Added `notes`, `payment_method`
- ✅ Added `reminder_sent_at`

**payments**
- ✅ Added soft deletes
- ✅ Added `status` (pending/success/failed/refunded)
- ✅ Added `payment_gateway`
- ✅ Added `proof_url` for manual transfers
- ✅ Added `verified_by`, `verified_at`
- ✅ Added `notes`

**order_items**
- ✅ Added soft deletes
- ✅ Added `customization` (JSON)
- ✅ Added `discount_amount`, `subtotal`
- ✅ Added `notes`

**order_status_histories**
- ✅ Added `ip_address`, `user_agent` for audit trail

---

## 📊 Tables Summary

| # | Table Name | Purpose | UUID | Soft Delete | New/Updated |
|---|-----------|---------|------|-------------|-------------|
| 1 | users | System users | ❌ | ❌ | Existing |
| 2 | clients | Customers | ✅ | ✅ | **Enhanced** |
| 3 | services | Service catalog | ✅ | ✅ | **Enhanced** |
| 4 | tags | Tagging system | ✅ | ✅ | **Enhanced** |
| 5 | testimonials | Client reviews | ✅ | ✅ | **Enhanced** |
| 6 | portfolio_projects | Project showcase | ✅ | ✅ | **Enhanced** |
| 7 | posts | Blog articles | ✅ | ✅ | **Enhanced** |
| 8 | orders | Client orders | ✅ | ✅ | **Enhanced** |
| 9 | invoices | Invoices | ✅ | ✅ | **Enhanced** |
| 10 | payments | Payment records | ✅ | ✅ | **Enhanced** |
| 11 | order_items | Order line items | ✅ | ✅ | **Enhanced** |
| 12 | taggables | Polymorphic pivot | ✅ | ❌ | Existing |
| 13 | order_status_histories | Status tracking | ✅ | ❌ | **Enhanced** |
| 14 | activity_logs | Activity tracking | ✅ | ❌ | **NEW** |
| 15 | notifications | Notifications | ✅ | ❌ | **NEW** |
| 16 | quotations | Price quotes | ✅ | ✅ | **NEW** |
| 17 | quotation_items | Quote line items | ✅ | ❌ | **NEW** |
| 18 | media | Media library | ✅ | ❌ | **NEW** |

---

## 🚀 Migration Guide

### Step 1: Backup Database

```bash
# PostgreSQL
pg_dump -U postgres cipta_koding > backup_$(date +%Y%m%d).sql

# MySQL
mysqldump -u root -p cipta_koding > backup_$(date +%Y%m%d).sql
```

### Step 2: Run New Migration

```bash
# Run the improvement migration
php artisan migrate --path=database/migrations/2025_11_28_120000_improved_tables.php

# Or run all pending migrations
php artisan migrate
```

### Step 3: Verify Changes

```bash
# Check tables
php artisan db:show

# Check specific table structure
php artisan db:table clients
php artisan db:table services
```

### Step 4: Update Models

Update your Eloquent models to include new fields:

```php
// app/Models/Client.php
class Client extends Model
{
    protected $fillable = [
        'name', 'email', 'phone_number', 'address',
        'company_name', 'company_website', 'type', 'status',
        'referred_by', 'referral_code', 'metadata',
    ];
    
    protected $casts = [
        'metadata' => 'array',
        'type' => 'string',
        'status' => 'string',
    ];
    
    public function referrer()
    {
        return $this->belongsTo(Client::class, 'referred_by');
    }
    
    public function referrals()
    {
        return $this->hasMany(Client::class, 'referred_by');
    }
}

// app/Models/Service.php
class Service extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'base_price', 'is_active',
        'category', 'icon', 'estimated_days', 'features', 'pricing_tiers',
        'meta_title', 'meta_description', 'display_order',
    ];
    
    protected $casts = [
        'features' => 'array',
        'pricing_tiers' => 'array',
        'is_active' => 'boolean',
        'base_price' => 'integer',
        'estimated_days' => 'integer',
        'display_order' => 'integer',
    ];
}

// app/Models/Order.php
class Order extends Model
{
    protected $fillable = [
        'order_code', 'client_id', 'status', 'final_amount', 'notes',
        'discount_amount', 'discount_type', 'discount_code',
        'estimated_completion_date', 'priority', 'assigned_to',
        'confirmed_at', 'started_at', 'completed_at', 'cancelled_at',
    ];
    
    protected $casts = [
        'final_amount' => 'integer',
        'discount_amount' => 'integer',
        'estimated_completion_date' => 'date',
        'confirmed_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];
    
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
```

### Step 5: Seed Sample Data (Optional)

```bash
php artisan db:seed
```

---

## 📦 New Features Enabled

### 1. Activity Logging

```php
// Log user activities
ActivityLog::create([
    'user_id' => auth()->id(),
    'action' => 'order.created',
    'model_type' => Order::class,
    'model_id' => $order->id,
    'properties' => ['order_code' => $order->order_code],
    'ip_address' => request()->ip(),
    'user_agent' => request()->userAgent(),
]);
```

### 2. Notifications

```php
// Send notification
$client->notify(new OrderStatusChanged($order));

// Mark as read
$notification->markAsRead();
```

### 3. Quotations

```php
// Create quotation
$quotation = Quotation::create([
    'quotation_code' => 'QUO-20251128-0001',
    'client_id' => $client->id,
    'status' => 'draft',
    'valid_until' => now()->addDays(30),
]);

// Add items
$quotation->items()->create([
    'item_type' => Service::class,
    'item_id' => $service->id,
    'description' => $service->name,
    'quantity' => 1,
    'unit_price' => 5000000,
    'subtotal' => 5000000,
]);

// Convert to order
$order = $quotation->convertToOrder();
```

### 4. Media Library

```php
// Attach media
$project->addMedia($file)
    ->toMediaCollection('images');

// Get media
$images = $project->getMedia('images');
```

### 5. Referral System

```php
// Generate referral code
$client->update([
    'referral_code' => Str::random(10),
]);

// Track referral
$newClient = Client::create([
    'name' => 'New Client',
    'email' => 'new@example.com',
    'referred_by' => $referrer->id,
]);

// Get referrals
$referrals = $client->referrals;
```

---

## 🔍 Query Examples

### Get VIP Clients

```php
$vipClients = Client::where('status', 'active')
    ->whereHas('orders', function($q) {
        $q->selectRaw('client_id, SUM(final_amount) as total')
            ->groupBy('client_id')
            ->having('total', '>=', 50000000);
    })
    ->get();
```

### Get Overdue Invoices

```php
$overdueInvoices = Invoice::where('status', 'unpaid')
    ->where('due_date', '<', now())
    ->with('order.client')
    ->get();
```

### Get Popular Services

```php
$popularServices = Service::withCount('orderItems')
    ->orderBy('order_items_count', 'desc')
    ->take(10)
    ->get();
```

### Get Client Activity

```php
$activities = ActivityLog::where('user_id', $user->id)
    ->orderBy('created_at', 'desc')
    ->paginate(20);
```

---

## ⚠️ Important Notes

### Breaking Changes
- ❌ **None** - All changes are additive (new columns/tables)
- ✅ Existing data remains intact
- ✅ Existing queries continue to work

### Performance Considerations
- ✅ New indexes added for better query performance
- ✅ Composite indexes for common query patterns
- ✅ JSON columns for flexible data storage

### Recommended Actions
1. Update all Eloquent models
2. Update API resources/transformers
3. Update form requests/validation
4. Update seeders/factories
5. Update tests

---

## 📞 Support

Jika ada pertanyaan atau issues:
- Check migration file: `database/migrations/2025_11_28_120000_improved_tables.php`
- Review model changes
- Test in development first

---

**Maintained By:** Cipta Koding Development Team
