# 🗄️ Database Schema Documentation

> Dokumentasi lengkap struktur database Cipta Koding Platform

**Last Updated:** November 28, 2025  
**Version:** 1.0.0  
**Database:** PostgreSQL / MySQL

---

## 📋 Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migrations](#migrations)
- [Seeders](#seeders)

---

## 🎯 Overview

Database ini dirancang untuk mendukung platform layanan pembuatan aplikasi dengan fitur:
- Multi-client order management
- Flexible service catalog
- Invoice & payment tracking
- Portfolio & content management
- Polymorphic tagging system

### Database Statistics
- **Total Tables:** 12
- **Total Relationships:** 15+
- **Polymorphic Relations:** 2
- **Soft Deletes:** 10 tables
- **UUID Primary Keys:** All tables

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐         ┌──────────────┐
│    posts    │◄────────┤     tags     │
└─────────────┘   N:M   └──────────────┘
                  via           │
              taggables         │
                                │
┌─────────────┐                 │
│  clients    │                 │
└──────┬──────┘                 │
       │                        │
       │ 1:N                    │
       ▼                        │
┌─────────────┐                 │
│   orders    │                 │
└──────┬──────┘                 │
       │                        │
       ├─────────┬──────────────┼──────────┐
       │ 1:N     │ 1:N          │ 1:N      │
       ▼         ▼              ▼          │
┌─────────┐ ┌──────────┐ ┌────────────┐   │
│invoices │ │order_items│ │order_status│   │
└────┬────┘ └──────────┘ │_histories  │   │
     │                   └────────────┘   │
     │ 1:N                                │
     ▼                                    │
┌─────────┐                               │
│payments │                               │
└─────────┘                               │
                                          │
┌──────────────┐                          │
│  services    │◄─────────────────────────┘
└──────────────┘         N:M
       │                 via
       │            order_items
       │           (polymorphic)
       │
┌──────────────────┐
│portfolio_projects│◄────────┐
└──────────────────┘         │
                             │
┌──────────────┐             │
│testimonials  │◄────────────┤
└──────────────┘             │
                             │
                      ┌──────┴──────┐
                      │   clients   │
                      └─────────────┘
```

---

## 📚 Tables

### 1. users

**Purpose:** Menyimpan data user (admin, staff, dll)  
**Type:** System table (Laravel default)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | bigint | NO | auto | Primary key |
| name | varchar(255) | NO | - | Full name |
| email | varchar(255) | NO | - | Email (unique) |
| email_verified_at | timestamp | YES | NULL | Email verification |
| password | varchar(255) | NO | - | Hashed password |
| remember_token | varchar(100) | YES | NULL | Remember me token |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (email)

**Relationships:**
- Has many: posts
- Has many: order_status_histories (as changed_by)

---

### 2. clients

**Purpose:** Menyimpan data client/customer  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | varchar(255) | NO | - | Client name |
| email | varchar(255) | NO | - | Email (unique) |
| phone_number | varchar(20) | YES | NULL | Phone number |
| address | text | YES | NULL | Full address |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (email)
- INDEX (phone_number)
- INDEX (deleted_at)

**Relationships:**
- Has many: orders
- Has many: testimonials
- Has many: portfolio_projects

**Business Rules:**
- Email must be unique
- Phone number optional but indexed for quick search
- Soft delete untuk maintain data integrity

---

### 3. services

**Purpose:** Katalog layanan yang ditawarkan  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | varchar(255) | NO | - | Service name |
| slug | varchar(255) | NO | - | URL-friendly slug (unique) |
| description | text | NO | - | Service description |
| base_price | decimal(19,0) | YES | NULL | Base price in IDR |
| is_active | boolean | NO | true | Active status |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- INDEX (is_active)
- INDEX (deleted_at)

**Relationships:**
- Has many: order_items (polymorphic)
- Belongs to many: tags (via taggables)

**Business Rules:**
- Slug auto-generated from name
- base_price nullable untuk custom pricing
- is_active untuk hide/show service

**Suggested Additions:**
```sql
-- Add these columns for better functionality
ALTER TABLE services ADD COLUMN category varchar(50);
ALTER TABLE services ADD COLUMN icon varchar(100);
ALTER TABLE services ADD COLUMN estimated_days integer;
ALTER TABLE services ADD COLUMN features json;
ALTER TABLE services ADD COLUMN pricing_tiers json;
```

---

### 4. tags

**Purpose:** Tag system untuk categorization  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | varchar(255) | NO | - | Tag name (unique) |
| slug | varchar(255) | NO | - | URL-friendly slug (unique) |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (name)
- UNIQUE (slug)
- INDEX (deleted_at)

**Relationships:**
- Belongs to many: services (via taggables)
- Belongs to many: portfolio_projects (via taggables)
- Belongs to many: posts (via taggables)

**Suggested Additions:**
```sql
ALTER TABLE tags ADD COLUMN type varchar(50); -- 'service', 'portfolio', 'post'
ALTER TABLE tags ADD COLUMN color varchar(7); -- Hex color for UI
ALTER TABLE tags ADD COLUMN usage_count integer DEFAULT 0;
```

---

### 5. testimonials

**Purpose:** Client testimonials/reviews  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| client_name | varchar(255) | NO | - | Client name |
| client_position | varchar(255) | YES | NULL | Client position/title |
| client_id | uuid | YES | NULL | Foreign key to clients |
| content | text | NO | - | Testimonial content |
| is_featured | boolean | NO | false | Featured on homepage |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
- INDEX (is_featured)
- INDEX (deleted_at)

**Relationships:**
- Belongs to: client (optional)

**Business Rules:**
- client_id nullable untuk support manual testimonials
- client_name always required (manual or from client)
- is_featured untuk homepage display

**Suggested Additions:**
```sql
ALTER TABLE testimonials ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE testimonials ADD COLUMN company_name varchar(255);
ALTER TABLE testimonials ADD COLUMN avatar_url varchar(255);
ALTER TABLE testimonials ADD COLUMN project_id uuid REFERENCES portfolio_projects(id);
```

---

### 6. portfolio_projects

**Purpose:** Showcase completed projects  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| title | varchar(255) | NO | - | Project title |
| slug | varchar(255) | NO | - | URL-friendly slug (unique) |
| description | text | NO | - | Project description |
| project_url | varchar(255) | YES | NULL | Live project URL |
| cover_image_url | varchar(255) | YES | NULL | Cover image URL |
| completed_date | date | YES | NULL | Project completion date |
| client_id | uuid | YES | NULL | Foreign key to clients |
| client_name | varchar(255) | YES | NULL | Client name (manual) |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
- INDEX (completed_date)
- INDEX (deleted_at)

**Relationships:**
- Belongs to: client (optional)
- Belongs to many: tags (via taggables)

**Business Rules:**
- Either client_id or client_name must be filled
- Slug auto-generated from title
- completed_date untuk sorting

**Suggested Additions:**
```sql
ALTER TABLE portfolio_projects ADD COLUMN tech_stack json;
ALTER TABLE portfolio_projects ADD COLUMN images json; -- Array of image URLs
ALTER TABLE portfolio_projects ADD COLUMN github_url varchar(255);
ALTER TABLE portfolio_projects ADD COLUMN duration_days integer;
ALTER TABLE portfolio_projects ADD COLUMN team_size integer;
ALTER TABLE portfolio_projects ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE portfolio_projects ADD COLUMN view_count integer DEFAULT 0;
```

---

### 7. posts

**Purpose:** Blog posts/articles  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | Foreign key to users (author) |
| title | varchar(255) | NO | - | Post title |
| slug | varchar(255) | NO | - | URL-friendly slug (unique) |
| excerpt | text | YES | NULL | Short excerpt |
| body | longtext | NO | - | Post content (HTML/Markdown) |
| cover_image_url | varchar(255) | YES | NULL | Cover image URL |
| status | enum | NO | 'draft' | 'draft' or 'published' |
| published_at | timestamptz | YES | NULL | Published timestamp |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- INDEX (status)
- INDEX (published_at)
- INDEX (deleted_at)

**Relationships:**
- Belongs to: user (author)
- Belongs to many: tags (via taggables)

**Business Rules:**
- Only published posts shown to public
- published_at set when status changed to 'published'
- Slug auto-generated from title

**Suggested Additions:**
```sql
ALTER TABLE posts ADD COLUMN view_count integer DEFAULT 0;
ALTER TABLE posts ADD COLUMN reading_time integer; -- in minutes
ALTER TABLE posts ADD COLUMN meta_title varchar(255);
ALTER TABLE posts ADD COLUMN meta_description varchar(255);
ALTER TABLE posts ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN category varchar(100);
```

---

### 8. orders

**Purpose:** Client orders  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_code | varchar(20) | NO | - | Unique order code |
| client_id | uuid | NO | - | Foreign key to clients |
| status | enum | NO | 'Menunggu Konfirmasi' | Order status |
| final_amount | decimal(19,0) | YES | NULL | Final order amount |
| notes | text | YES | NULL | Order notes |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (order_code)
- FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
- INDEX (status)
- INDEX (deleted_at)

**Relationships:**
- Belongs to: client
- Has many: order_items
- Has many: invoices
- Has many: order_status_histories

**Status Values:**
1. `Menunggu Konfirmasi` - Waiting for admin confirmation
2. `Menunggu Pembayaran` - Waiting for payment
3. `Sedang Dikerjakan` - In progress
4. `Review` - Under review
5. `Selesai` - Completed
6. `Dibatalkan` - Cancelled

**Business Rules:**
- order_code format: `ORD-YYYYMMDD-XXXX`
- final_amount calculated from order_items
- Status changes tracked in order_status_histories

**Check Constraints:**
```sql
ALTER TABLE orders ADD CONSTRAINT orders_final_amount_nonneg 
  CHECK (final_amount IS NULL OR final_amount >= 0);
```

**Suggested Additions:**
```sql
ALTER TABLE orders ADD COLUMN discount_amount decimal(19,0) DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_type varchar(20); -- 'percentage', 'fixed'
ALTER TABLE orders ADD COLUMN discount_code varchar(50);
ALTER TABLE orders ADD COLUMN estimated_completion_date date;
ALTER TABLE orders ADD COLUMN priority varchar(20) DEFAULT 'normal'; -- 'low', 'normal', 'high', 'urgent'
ALTER TABLE orders ADD COLUMN assigned_to uuid REFERENCES users(id);
```

---

### 9. invoices

**Purpose:** Invoice generation and tracking  
**UUID:** ✅ Yes  
**Soft Delete:** ✅ Yes

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| invoice_code | varchar(20) | NO | - | Unique invoice code |
| order_id | uuid | NO | - | Foreign key to orders |
| type | enum | YES | NULL | Invoice type |
| amount | decimal(19,0) | NO | - | Invoice amount |
| status | enum | NO | 'unpaid' | Payment status |
| due_date | date | NO | - | Payment due date |
| paid_at | timestamptz | YES | NULL | Payment timestamp |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |
| deleted_at | timestamp | YES | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (invoice_code)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- INDEX (type)
- INDEX (status)
- INDEX (due_date)
- INDEX (deleted_at)

**Relationships:**
- Belongs to: order
- Has many: payments

**Invoice Types:**
1. `dp` - Down Payment (30-50%)
2. `pelunasan` - Final Payment
3. `milestone` - Milestone-based Payment
4. `full` - Full Payment (100%)

**Invoice Status:**
1. `unpaid` - Not yet paid
2. `paid` - Fully paid
3. `overdue` - Past due date
4. `cancelled` - Cancelled

**Business Rules:**
- invoice_code format: `INV-YYYYMMDD-XXXX`
- Auto-mark as overdue when due_date passed
- paid_at set when status changed to 'paid'

**Check Constraints:**
```sql
ALTER TABLE invoices ADD CONSTRAINT invoices_amount_nonneg 
  CHECK (amount >= 0);
```

**Suggested Additions:**
```sql
ALTER TABLE invoices ADD COLUMN tax_amount decimal(19,0) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN tax_percentage decimal(5,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN subtotal decimal(19,0);
ALTER TABLE invoices ADD COLUMN notes text;
ALTER TABLE invoices ADD COLUMN payment_method varchar(50);
ALTER TABLE invoices ADD COLUMN reminder_sent_at timestamp;
```

---

### 10. payments

**Purpose:** Payment records  
**UUID:** ✅ Yes  
**Soft Delete:** ❌ No (Recommended to add)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| invoice_id | uuid | NO | - | Foreign key to invoices |
| amount | decimal(19,0) | NO | - | Payment amount |
| method | varchar(255) | YES | NULL | Payment method |
| reference | varchar(255) | YES | NULL | Payment reference/transaction ID |
| paid_at | timestamptz | YES | NULL | Payment timestamp |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
- INDEX (invoice_id, paid_at)

**Relationships:**
- Belongs to: invoice

**Payment Methods:**
- `bank_transfer` - Manual bank transfer
- `credit_card` - Credit/debit card
- `virtual_account` - Virtual account
- `e_wallet` - E-wallet (GoPay, OVO, DANA)
- `qris` - QRIS
- `cash` - Cash payment

**Business Rules:**
- Multiple payments can be made for one invoice (partial payments)
- reference stores payment gateway transaction ID

**Check Constraints:**
```sql
ALTER TABLE payments ADD CONSTRAINT payments_amount_pos 
  CHECK (amount > 0);
```

**Suggested Additions:**
```sql
ALTER TABLE payments ADD COLUMN deleted_at timestamp; -- Add soft delete
ALTER TABLE payments ADD COLUMN status varchar(20) DEFAULT 'pending'; -- 'pending', 'success', 'failed'
ALTER TABLE payments ADD COLUMN payment_gateway varchar(50); -- 'midtrans', 'xendit', 'manual'
ALTER TABLE payments ADD COLUMN proof_url varchar(255); -- For manual transfer
ALTER TABLE payments ADD COLUMN verified_by uuid REFERENCES users(id);
ALTER TABLE payments ADD COLUMN verified_at timestamp;
ALTER TABLE payments ADD COLUMN notes text;
```

---

### 11. order_items

**Purpose:** Items in an order (polymorphic)  
**UUID:** ✅ Yes  
**Soft Delete:** ❌ No (Recommended to add)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Foreign key to orders |
| item_type | varchar(255) | NO | - | Polymorphic type |
| item_id | uuid | NO | - | Polymorphic ID |
| quantity | integer | NO | 1 | Item quantity |
| price | decimal(19,0) | NO | - | Item price |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- INDEX (order_id)
- INDEX (item_type, item_id)

**Relationships:**
- Belongs to: order
- Morphs to: item (Service, or custom items)

**Business Rules:**
- item_type typically 'App\Models\Service'
- price can differ from service base_price (custom pricing)
- quantity for multiple same items

**Check Constraints:**
```sql
ALTER TABLE order_items ADD CONSTRAINT order_items_qty_pos 
  CHECK (quantity >= 1);
  
ALTER TABLE order_items ADD CONSTRAINT order_items_price_nonneg 
  CHECK (price >= 0);
```

**Suggested Additions:**
```sql
ALTER TABLE order_items ADD COLUMN deleted_at timestamp; -- Add soft delete
ALTER TABLE order_items ADD COLUMN customization json; -- Custom requirements
ALTER TABLE order_items ADD COLUMN discount_amount decimal(19,0) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN subtotal decimal(19,0); -- price * quantity
ALTER TABLE order_items ADD COLUMN notes text;
```

---

### 12. taggables

**Purpose:** Polymorphic pivot table for tags  
**UUID:** ✅ Yes  
**Soft Delete:** ❌ No

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| tag_id | uuid | NO | - | Foreign key to tags |
| taggable_type | varchar(255) | NO | - | Polymorphic type |
| taggable_id | uuid | NO | - | Polymorphic ID |

**Indexes:**
- PRIMARY KEY (tag_id, taggable_id, taggable_type)
- FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
- INDEX (taggable_type, taggable_id)

**Relationships:**
- Belongs to: tag
- Morphs to: taggable (Service, PortfolioProject, Post)

**Business Rules:**
- Composite primary key prevents duplicates
- Cascade delete when tag deleted

---

### 13. order_status_histories

**Purpose:** Track order status changes  
**UUID:** ✅ Yes  
**Soft Delete:** ❌ No

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| order_id | uuid | NO | - | Foreign key to orders |
| from_status | enum | YES | NULL | Previous status |
| to_status | enum | NO | - | New status |
| changed_by | uuid | YES | NULL | Foreign key to users |
| note | text | YES | NULL | Change note |
| created_at | timestamp | YES | NULL | Created timestamp |
| updated_at | timestamp | YES | NULL | Updated timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
- FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
- INDEX (order_id)

**Relationships:**
- Belongs to: order
- Belongs to: user (changed_by)

**Status Values:** (Same as orders table)
1. `Menunggu Konfirmasi`
2. `Menunggu Pembayaran`
3. `Sedang Dikerjakan`
4. `Review`
5. `Selesai`
6. `Dibatalkan`

**Business Rules:**
- from_status NULL for first status
- changed_by NULL for system changes
- Immutable records (no updates/deletes)

---

## 🔗 Relationships

### One-to-Many Relationships

```
users (1) ──────► posts (N)
users (1) ──────► order_status_histories (N) [as changed_by]

clients (1) ─────► orders (N)
clients (1) ─────► testimonials (N)
clients (1) ─────► portfolio_projects (N)

orders (1) ──────► order_items (N)
orders (1) ──────► invoices (N)
orders (1) ──────► order_status_histories (N)

invoices (1) ────► payments (N)
```

### Many-to-Many Relationships (Polymorphic)

```
tags (N) ◄──────► services (N)        via taggables
tags (N) ◄──────► portfolio_projects (N)  via taggables
tags (N) ◄──────► posts (N)           via taggables
```

### Polymorphic Relationships

```
order_items.item ──► Service (or other models)
taggables.taggable ──► Service | PortfolioProject | Post
```

---

## 📇 Indexes

### Primary Indexes
All tables use UUID primary keys with automatic generation (PostgreSQL) or manual generation (MySQL).

### Unique Indexes
```sql
-- Unique constraints
clients.email
services.slug
tags.name
tags.slug
portfolio_projects.slug
posts.slug
orders.order_code
invoices.invoice_code
```

### Performance Indexes
```sql
-- For faster queries
clients.phone_number
services.is_active
testimonials.is_featured
portfolio_projects.completed_date
posts.status
posts.published_at
orders.status
invoices.type
invoices.status
invoices.due_date
payments(invoice_id, paid_at) -- Composite
order_items.order_id
```

### Foreign Key Indexes
All foreign keys automatically indexed for join performance.

---

## 🔒 Constraints

### Check Constraints

```sql
-- Financial constraints
ALTER TABLE orders 
  ADD CONSTRAINT orders_final_amount_nonneg 
  CHECK (final_amount IS NULL OR final_amount >= 0);

ALTER TABLE invoices 
  ADD CONSTRAINT invoices_amount_nonneg 
  CHECK (amount >= 0);

ALTER TABLE payments 
  ADD CONSTRAINT payments_amount_pos 
  CHECK (amount > 0);

-- Quantity constraints
ALTER TABLE order_items 
  ADD CONSTRAINT order_items_qty_pos 
  CHECK (quantity >= 1);

ALTER TABLE order_items 
  ADD CONSTRAINT order_items_price_nonneg 
  CHECK (price >= 0);
```

### Foreign Key Constraints

```sql
-- Cascade deletes
posts.user_id → users.id (CASCADE)
orders.client_id → clients.id (CASCADE)
order_items.order_id → orders.id (CASCADE)
invoices.order_id → orders.id (CASCADE)
payments.invoice_id → invoices.id (CASCADE)
order_status_histories.order_id → orders.id (CASCADE)
taggables.tag_id → tags.id (CASCADE)

-- Set null on delete
testimonials.client_id → clients.id (SET NULL)
portfolio_projects.client_id → clients.id (SET NULL)
order_status_histories.changed_by → users.id (SET NULL)
```

---

## 🔄 Migrations

### Running Migrations

```bash
# Run all migrations
php artisan migrate

# Rollback last batch
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Refresh database (drop all tables and re-run)
php artisan migrate:refresh

# Refresh with seeding
php artisan migrate:refresh --seed
```

### Migration Order

1. `users` (Laravel default)
2. `clients`
3. `services`
4. `tags`
5. `testimonials`
6. `portfolio_projects`
7. `posts`
8. `orders`
9. `invoices`
10. `payments`
11. `order_items`
12. `taggables`
13. `order_status_histories`

---

## 🌱 Seeders

### Recommended Seeders

```php
// DatabaseSeeder.php
public function run()
{
    $this->call([
        UserSeeder::class,
        ClientSeeder::class,
        ServiceSeeder::class,
        TagSeeder::class,
        PortfolioProjectSeeder::class,
        TestimonialSeeder::class,
        PostSeeder::class,
        // OrderSeeder::class, // Optional for testing
    ]);
}
```

### Sample Data

```php
// ServiceSeeder example
Service::create([
    'name' => 'Website Development',
    'slug' => 'website-development',
    'description' => 'Custom website development services',
    'base_price' => 5000000,
    'is_active' => true,
]);

// ClientSeeder example
Client::create([
    'name' => 'PT Example Indonesia',
    'email' => 'contact@example.com',
    'phone_number' => '081234567890',
    'address' => 'Jakarta, Indonesia',
]);
```

---

## 📊 Database Statistics Queries

### Get table sizes
```sql
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

### Count records per table
```sql
SELECT 
    'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
```

---

## 🔧 Maintenance

### Optimize Tables (MySQL)
```sql
OPTIMIZE TABLE clients, orders, invoices, payments;
```

### Vacuum (PostgreSQL)
```sql
VACUUM ANALYZE;
```

### Rebuild Indexes
```sql
REINDEX DATABASE your_database_name;
```

---

## 📝 Notes

### UUID vs Auto-Increment
- ✅ **Pros:** Better security, distributed systems friendly, no sequential guessing
- ⚠️ **Cons:** Slightly larger storage, not human-readable

### Soft Deletes
- Used in 10 tables for data integrity
- Can be restored if needed
- Queries automatically exclude soft-deleted records

### Decimal Precision
- Using `decimal(19,0)` for IDR (no decimal places)
- Consider changing to `decimal(19,2)` if need decimal precision

### Enum vs String
- Using ENUM for fixed values (status, type)
- Consider using lookup tables for frequently changing values

---

## 🚀 Future Enhancements

### Recommended Additional Tables

1. **activity_logs** - User activity tracking
2. **notifications** - User notifications
3. **settings** - Application settings
4. **media** - Media library
5. **comments** - Blog comments
6. **quotations** - Price quotations
7. **contracts** - Digital contracts
8. **expenses** - Business expenses
9. **teams** - Team management
10. **roles & permissions** - RBAC

### Performance Optimizations

1. Add full-text search indexes
2. Implement database partitioning for large tables
3. Add materialized views for complex queries
4. Implement database caching (Redis)
5. Add read replicas for scaling

---

**Last Updated:** November 28, 2025  
**Maintained By:** Cipta Koding Development Team
