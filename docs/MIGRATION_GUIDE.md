# 📋 Database Migration - Improvements Summary

> Summary of database improvements and how to apply them

**Date:** November 28, 2025  
**Migration File:** `2025_11_28_120000_improved_tables.php`

---

## 🎯 What's New

### ✨ 5 New Tables

1. **activity_logs** - Track all user activities
2. **notifications** - User notification system
3. **quotations** - Price quotations before orders
4. **quotation_items** - Line items in quotations
5. **media** - Media library for file management

### 🔧 12 Enhanced Tables

All existing tables have been improved with additional fields for better functionality.

---

## 🚀 Quick Start

### 1. Review Changes

```bash
# View the migration file
cat database/migrations/2025_11_28_120000_improved_tables.php
```

### 2. Backup Database

```bash
# PostgreSQL
pg_dump -U postgres cipta_koding > backup_before_migration.sql

# MySQL
mysqldump -u root -p cipta_koding > backup_before_migration.sql
```

### 3. Run Migration

```bash
# Run the specific migration
php artisan migrate --path=database/migrations/2025_11_28_120000_improved_tables.php

# Or run all pending migrations
php artisan migrate
```

### 4. Verify

```bash
# Check database structure
php artisan db:show

# Check specific tables
php artisan db:table clients
php artisan db:table services
php artisan db:table orders
```

---

## 📊 Detailed Changes

### Clients Table

**New Fields:**
- `company_name` - Company name (nullable)
- `company_website` - Company website URL
- `type` - Client type: 'individual' or 'company'
- `status` - Client status: 'active', 'inactive', 'blocked'
- `referred_by` - Reference to referring client (for referral program)
- `referral_code` - Unique referral code
- `metadata` - JSON field for additional data

**Use Cases:**
- Distinguish between individual and corporate clients
- Implement referral program
- Track client status
- Store flexible metadata

---

### Services Table

**New Fields:**
- `category` - Service category (e.g., 'web', 'mobile', 'desktop')
- `icon` - Icon identifier for UI
- `estimated_days` - Estimated completion time in days
- `features` - JSON array of features
- `pricing_tiers` - JSON object with pricing options
- `meta_title` - SEO meta title
- `meta_description` - SEO meta description
- `display_order` - Order for displaying services

**Use Cases:**
- Better service categorization
- Display estimated timeline
- Flexible pricing tiers (Basic, Pro, Enterprise)
- SEO optimization
- Custom ordering

---

### Tags Table

**New Fields:**
- `type` - Tag type: 'service', 'portfolio', 'post'
- `color` - Hex color code for UI
- `usage_count` - Counter for tag usage
- `description` - Tag description

**Use Cases:**
- Categorize tags by type
- Visual distinction with colors
- Track popular tags
- Better tag management

---

### Testimonials Table

**New Fields:**
- `rating` - Star rating (1-5)
- `company_name` - Client's company
- `avatar_url` - Client photo URL
- `project_id` - Reference to portfolio project
- `display_order` - Custom ordering

**Use Cases:**
- Star ratings for testimonials
- Link testimonials to projects
- Display client photos
- Custom ordering for featured testimonials

---

### Portfolio Projects Table

**New Fields:**
- `tech_stack` - JSON array of technologies used
- `images` - JSON array of additional images
- `github_url` - GitHub repository URL
- `duration_days` - Project duration
- `team_size` - Number of team members
- `is_featured` - Featured project flag
- `view_count` - Page view counter
- `meta_title` - SEO meta title
- `meta_description` - SEO meta description

**Use Cases:**
- Showcase technologies used
- Display project metrics
- Track popular projects
- SEO optimization
- Feature important projects

---

### Posts Table

**New Fields:**
- `view_count` - Article view counter
- `reading_time` - Estimated reading time (minutes)
- `meta_title` - SEO meta title
- `meta_description` - SEO meta description
- `is_featured` - Featured post flag
- `category` - Post category

**Use Cases:**
- Track popular articles
- Display reading time
- SEO optimization
- Feature important posts
- Categorize blog posts

---

### Orders Table

**New Fields:**
- `discount_amount` - Discount value
- `discount_type` - 'percentage' or 'fixed'
- `discount_code` - Discount/promo code
- `estimated_completion_date` - Expected completion
- `priority` - 'low', 'normal', 'high', 'urgent'
- `assigned_to` - Assigned team member
- `confirmed_at` - Confirmation timestamp
- `started_at` - Start timestamp
- `completed_at` - Completion timestamp
- `cancelled_at` - Cancellation timestamp

**Use Cases:**
- Apply discounts/promo codes
- Track order timeline
- Prioritize urgent orders
- Assign orders to team members
- Detailed status tracking

---

### Invoices Table

**New Fields:**
- `type` - Now required with default 'full'
- `tax_amount` - Tax amount
- `tax_percentage` - Tax percentage
- `subtotal` - Subtotal before tax
- `notes` - Invoice notes
- `payment_method` - Preferred payment method
- `reminder_sent_at` - Last reminder timestamp

**Use Cases:**
- Tax calculation
- Payment reminders
- Invoice notes
- Track payment preferences

---

### Payments Table

**New Fields:**
- `deleted_at` - Soft delete (NEW)
- `status` - 'pending', 'success', 'failed', 'refunded'
- `payment_gateway` - 'midtrans', 'xendit', 'manual'
- `proof_url` - Payment proof for manual transfer
- `verified_by` - Admin who verified
- `verified_at` - Verification timestamp
- `notes` - Payment notes

**Use Cases:**
- Track payment status
- Manual payment verification
- Payment gateway tracking
- Audit trail
- Soft delete for data integrity

---

### Order Items Table

**New Fields:**
- `deleted_at` - Soft delete (NEW)
- `customization` - JSON field for custom requirements
- `discount_amount` - Item-level discount
- `subtotal` - Calculated subtotal
- `notes` - Item notes

**Use Cases:**
- Store custom requirements
- Item-level discounts
- Soft delete for data integrity
- Additional notes per item

---

### Order Status Histories Table

**New Fields:**
- `ip_address` - IP address of change
- `user_agent` - Browser/device info

**Use Cases:**
- Enhanced audit trail
- Security tracking
- Detect suspicious activities

---

## 🆕 New Tables Details

### Activity Logs

**Purpose:** Track all user activities for audit and analytics

**Fields:**
- `user_id` - User who performed action
- `action` - Action name (e.g., 'order.created')
- `model_type` - Related model type
- `model_id` - Related model ID
- `properties` - JSON with additional data
- `ip_address` - User's IP
- `user_agent` - Browser info

**Example:**
```php
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

---

### Notifications

**Purpose:** Laravel notifications table for user notifications

**Fields:**
- `type` - Notification class
- `notifiable_type` - User/Client model
- `notifiable_id` - User/Client ID
- `data` - Notification data (JSON)
- `read_at` - Read timestamp

**Example:**
```php
$client->notify(new OrderStatusChanged($order));
```

---

### Quotations

**Purpose:** Create price quotations before converting to orders

**Fields:**
- `quotation_code` - Unique code (QUO-YYYYMMDD-XXXX)
- `client_id` - Client reference
- `status` - 'draft', 'sent', 'accepted', 'rejected', 'expired'
- `subtotal` - Subtotal amount
- `discount_amount` - Discount
- `tax_amount` - Tax
- `total_amount` - Total
- `terms_conditions` - T&C text
- `notes` - Additional notes
- `valid_until` - Expiry date
- `sent_at` - Send timestamp
- `accepted_at` - Acceptance timestamp
- `rejected_at` - Rejection timestamp
- `order_id` - Converted order reference

**Example:**
```php
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

// Send to client
$quotation->update(['status' => 'sent', 'sent_at' => now()]);

// Convert to order
$order = $quotation->convertToOrder();
```

---

### Quotation Items

**Purpose:** Line items in quotations

**Fields:**
- `quotation_id` - Quotation reference
- `item_type` - Polymorphic type (Service, etc)
- `item_id` - Polymorphic ID
- `description` - Item description
- `quantity` - Quantity
- `unit_price` - Price per unit
- `subtotal` - Total for this item

---

### Media

**Purpose:** Media library for file management (images, documents, etc)

**Fields:**
- `model_type` - Related model type
- `model_id` - Related model ID
- `collection_name` - Media collection (e.g., 'images', 'documents')
- `name` - Original name
- `file_name` - Stored filename
- `mime_type` - File MIME type
- `disk` - Storage disk
- `size` - File size in bytes
- `manipulations` - JSON with image manipulations
- `custom_properties` - JSON with custom data
- `order_column` - Display order

**Example:**
```php
// Attach media
$project->addMedia($file)
    ->toMediaCollection('images');

// Get media
$images = $project->getMedia('images');
$firstImage = $project->getFirstMediaUrl('images');
```

---

## 🔄 Rollback

If you need to rollback:

```bash
# Rollback last migration
php artisan migrate:rollback

# Rollback specific migration
php artisan migrate:rollback --path=database/migrations/2025_11_28_120000_improved_tables.php

# Restore from backup
# PostgreSQL
psql -U postgres cipta_koding < backup_before_migration.sql

# MySQL
mysql -u root -p cipta_koding < backup_before_migration.sql
```

---

## ✅ Post-Migration Checklist

- [ ] Backup completed
- [ ] Migration ran successfully
- [ ] Database structure verified
- [ ] Models updated with new fields
- [ ] Casts added to models
- [ ] API resources updated
- [ ] Form validations updated
- [ ] Seeders updated (if needed)
- [ ] Tests updated
- [ ] Documentation updated

---

## 📝 Next Steps

1. **Update Models** - Add new fields to `$fillable` and `$casts`
2. **Update API** - Include new fields in API resources
3. **Update Forms** - Add new fields to forms and validation
4. **Update Seeders** - Include new fields in seeders
5. **Update Tests** - Test new functionality
6. **Deploy** - Deploy to staging first, then production

---

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check current migration status
php artisan migrate:status

# Check database connection
php artisan db:show

# Run with verbose output
php artisan migrate --verbose
```

### Column Already Exists

If you get "column already exists" error, it means you've already run part of the migration. You can:

1. Rollback and run again
2. Comment out the problematic columns
3. Create a new migration for remaining changes

### Foreign Key Constraint Fails

Make sure referenced tables exist and have data:

```bash
# Check if users table has data
php artisan tinker
>>> User::count()

# Check if clients table has data
>>> Client::count()
```

---

## 📞 Support

If you encounter issues:

1. Check migration file syntax
2. Verify database connection
3. Check Laravel logs: `storage/logs/laravel.log`
4. Review database error messages

---

**Created By:** Cipta Koding Development Team  
**Last Updated:** November 28, 2025
