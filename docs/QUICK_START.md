# 🚀 Quick Start Guide

> Panduan cepat untuk menjalankan Cipta Koding Platform

---

## 📋 Prerequisites

Pastikan sudah terinstall:
- ✅ PHP 8.1+
- ✅ Composer
- ✅ Node.js 18+
- ✅ PostgreSQL 14+ (atau MySQL 8+)
- ✅ Git

---

## 🎯 Setup Awal (First Time)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/ciptakoding/cipta-koding.git
cd cipta-koding

# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Configure Database

Edit file `.env`:

```env
# PostgreSQL (Recommended)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=cipta_koding
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Atau MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=cipta_koding
# DB_USERNAME=root
# DB_PASSWORD=
```

### 4. Create Database

**PostgreSQL:**
```bash
# Buka psql
psql -U postgres

# Buat database
CREATE DATABASE cipta_koding;

# Keluar
\q
```

**MySQL:**
```bash
# Buka MySQL
mysql -u root -p

# Buat database
CREATE DATABASE cipta_koding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Keluar
exit;
```

### 5. Run Migrations

```bash
# Jalankan semua migrations
php artisan migrate

# Atau dengan sample data
php artisan migrate --seed
```

---

## 🏃 Running Development

### **Opsi 1: Satu Command (Recommended)** ⭐

Jalankan Laravel + Vite sekaligus:

```bash
npm run dev:all
```

Output:
```
[VITE] VITE server running at http://localhost:5173
[LARAVEL] Laravel development server started: http://127.0.0.1:8000
```

**Akses:** Buka browser ke `http://127.0.0.1:8000`

---

### **Opsi 2: Manual (2 Terminal)**

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
# atau
npm run dev:server
```
Output: `http://127.0.0.1:8000`

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
```
Output: `http://localhost:5173`

**Akses:** Buka browser ke `http://127.0.0.1:8000`

---

## 📝 Available Commands

### Development

```bash
# Run both Laravel + Vite
npm run dev:all

# Run only Vite (frontend)
npm run dev

# Run only Laravel (backend)
npm run dev:server
# atau
php artisan serve
```

### Build Production

```bash
# Build frontend assets
npm run build

# Build with SSR
npm run build:ssr

# Optimize Laravel
php artisan optimize
```

### Database

```bash
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (drop all tables)
php artisan migrate:fresh

# Seed database
php artisan db:seed

# Fresh migration + seed
php artisan migrate:fresh --seed
```

### Code Quality

```bash
# Format code
npm run format

# Check formatting
npm run format:check

# Lint & fix
npm run lint

# Type check
npm run types
```

### Cache

```bash
# Clear all cache
php artisan optimize:clear

# Clear specific cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://127.0.0.1:8000 | Main application |
| **Vite Dev Server** | http://localhost:5173 | Hot reload assets |
| **Database** | localhost:5432 (PG) / 3306 (MySQL) | Database server |

---

## 🔧 Troubleshooting

### Port Already in Use

**Laravel (8000):**
```bash
# Use different port
php artisan serve --port=8001
```

**Vite (5173):**
Edit `vite.config.js`:
```js
export default defineConfig({
    server: {
        port: 5174, // Change port
    },
});
```

### Database Connection Failed

1. Check database is running
2. Verify credentials in `.env`
3. Test connection:
```bash
php artisan db:show
```

### Vite Not Loading

1. Clear cache:
```bash
npm run build
php artisan optimize:clear
```

2. Check `vite.config.js`
3. Restart dev server

### Migration Errors

```bash
# Rollback and try again
php artisan migrate:rollback
php artisan migrate

# Or fresh start
php artisan migrate:fresh
```

---

## 📚 Next Steps

1. ✅ Setup complete
2. 📖 Read [FEATURES.md](docs/FEATURES.md) - Understand features
3. 🗄️ Read [DATABASE_SCHEMA_V2.md](docs/DATABASE_SCHEMA_V2.md) - Database structure
4. 🔌 Read [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) - API endpoints
5. 👨‍💻 Read [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) - Development guidelines

---

## 🆘 Need Help?

- 📖 Documentation: `docs/` folder
- 🐛 Issues: GitHub Issues
- 💬 Support: support@ciptakoding.com

---

**Happy Coding!** 🚀
