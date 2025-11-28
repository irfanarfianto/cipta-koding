# 📖 README

> Platform Layanan Pembuatan Aplikasi dan Software

[![Laravel](https://img.shields.io/badge/Laravel-10.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.1+-blue.svg)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 About Cipta Koding

Cipta Koding adalah platform yang menyediakan layanan pembuatan aplikasi dan software untuk berbagai kebutuhan bisnis. Platform ini memudahkan client untuk memesan, melacak, dan mengelola project development mereka.

### ✨ Key Features

- 🛍️ **Order Management** - Sistem pemesanan yang mudah dan terstruktur
- 💰 **Invoice & Payment** - Integrasi payment gateway (Midtrans, Xendit)
- 📊 **Client Dashboard** - Dashboard untuk tracking order dan invoice
- 👨‍💼 **Admin Panel** - Comprehensive admin panel untuk manage operasional
- 📱 **Responsive Design** - Mobile-friendly interface
- 🔒 **Secure** - Authentication & authorization dengan Laravel Sanctum

---

## 🚀 Quick Start

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 18+
- PostgreSQL 14+ or MySQL 8+
- Redis (optional)

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

# Configure database in .env
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=cipta_koding
# DB_USERNAME=postgres
# DB_PASSWORD=

# Run migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Build assets
npm run dev

# Start development server
php artisan serve
```

Visit: `http://localhost:8000`

---

## 📚 Documentation

- [Features Documentation](docs/FEATURES.md) - Detailed feature specifications
- [Database Schema](docs/DATABASE_SCHEMA.md) - Database structure and relationships
- [API Documentation](docs/API_DOCUMENTATION.md) - REST API endpoints
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Development guidelines

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 10
- **Database:** PostgreSQL / MySQL
- **Cache:** Redis
- **Queue:** Redis
- **Authentication:** Laravel Sanctum

### Frontend
- **Framework:** Laravel Blade / Vue.js
- **CSS:** Tailwind CSS
- **Build Tool:** Vite
- **Icons:** Heroicons

### Payment Gateway
- Midtrans
- Xendit

---

## 📦 Project Structure

```
cipta-koding/
├── app/              # Application code
├── database/         # Migrations, seeders, factories
├── docs/             # Documentation
├── public/           # Public assets
├── resources/        # Views, JS, CSS
├── routes/           # Route definitions
└── tests/            # Tests
```

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test
php artisan test --filter OrderTest
```

---

## 🚀 Deployment

### Production Setup

```bash
# Optimize
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Build assets
npm run build

# Run migrations
php artisan migrate --force
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Development Team** - [Cipta Koding](https://ciptakoding.com)

---

## 📞 Support

- **Email:** support@ciptakoding.com
- **Website:** https://ciptakoding.com
- **Documentation:** https://docs.ciptakoding.com

---

Made with ❤️ by Cipta Koding Team
