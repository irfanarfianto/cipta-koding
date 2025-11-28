# 🚀 Development Guide

> Panduan development untuk Cipta Koding Platform

**Last Updated:** November 28, 2025

---

## 📋 Table of Contents

- [Setup Development](#setup-development)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🛠️ Setup Development

### Prerequisites
- PHP 8.1+
- Composer
- Node.js 18+
- PostgreSQL 14+ / MySQL 8+
- Redis

### Installation

```bash
# Clone repository
git clone https://github.com/ciptakoding/cipta-koding.git
cd cipta-koding

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Build assets
npm run dev

# Start server
php artisan serve
```

---

## 📁 Project Structure

```
cipta-koding/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   ├── Services/
│   └── Repositories/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── resources/
│   ├── views/
│   ├── js/
│   └── css/
├── routes/
│   ├── web.php
│   ├── api.php
│   └── admin.php
├── tests/
│   ├── Feature/
│   └── Unit/
└── docs/
```

---

## 📝 Coding Standards

### PHP (PSR-12)
```php
// Good
class OrderController extends Controller
{
    public function store(OrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create($request->validated());
        
        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ], 201);
    }
}
```

### JavaScript (ESLint)
```javascript
// Good
const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};
```

---

## 🔀 Git Workflow

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `refactor/what-refactored` - Code refactoring

### Commit Messages
```
feat: add order tracking feature
fix: resolve payment gateway timeout
docs: update API documentation
refactor: optimize database queries
test: add order service tests
```

### Pull Request
1. Create feature branch
2. Make changes
3. Write tests
4. Create PR with description
5. Request review
6. Merge after approval

---

## 🧪 Testing

### Run Tests
```bash
# All tests
php artisan test

# Specific test
php artisan test --filter OrderTest

# With coverage
php artisan test --coverage
```

### Writing Tests
```php
public function test_can_create_order()
{
    $user = User::factory()->create();
    $service = Service::factory()->create();
    
    $response = $this->actingAs($user)
        ->postJson('/api/v1/orders', [
            'items' => [
                ['service_id' => $service->id, 'quantity' => 1]
            ]
        ]);
    
    $response->assertStatus(201)
        ->assertJsonStructure(['success', 'data']);
}
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Run tests
- [ ] Update .env
- [ ] Migrate database
- [ ] Clear cache
- [ ] Optimize autoloader
- [ ] Build assets

### Deploy Commands
```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
npm run build
```

---

**Maintained By:** Cipta Koding Team
