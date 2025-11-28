# 🔌 API Documentation

> RESTful API Documentation untuk Cipta Koding Platform

**Version:** 1.0.0  
**Base URL:** `https://api.ciptakoding.com/api/v1`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Endpoints](#endpoints)
- [Webhooks](#webhooks)

---

## 🎯 Overview

Cipta Koding API menggunakan:
- **Protocol:** HTTPS only
- **Format:** JSON
- **Authentication:** Laravel Sanctum (Token-based)
- **Rate Limiting:** 60 req/min (authenticated), 20 req/min (guest)

---

## 🔐 Authentication

### Obtain Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "client@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "1|abc123...",
    "user": {
      "id": "uuid",
      "name": "John Doe"
    }
  }
}
```

### Using Token

```http
GET /api/v1/orders
Authorization: Bearer 1|abc123...
```

---

## 📦 Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-11-28T12:00:00Z"
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": {},
  "error_code": "VALIDATION_ERROR"
}
```

---

## 🔗 Endpoints

### Services

#### List Services
```http
GET /api/v1/services
```

#### Get Service
```http
GET /api/v1/services/{slug}
```

### Orders

#### List Orders
```http
GET /api/v1/orders
Authorization: Bearer {token}
```

#### Create Order
```http
POST /api/v1/orders
Authorization: Bearer {token}

{
  "items": [
    {
      "service_id": "uuid",
      "quantity": 1
    }
  ]
}
```

#### Get Order
```http
GET /api/v1/orders/{order_code}
Authorization: Bearer {token}
```

### Invoices

#### List Invoices
```http
GET /api/v1/invoices
Authorization: Bearer {token}
```

#### Get Invoice
```http
GET /api/v1/invoices/{invoice_code}
Authorization: Bearer {token}
```

---

## 🔔 Webhooks

### Events
- `order.created`
- `order.confirmed`
- `invoice.paid`
- `payment.received`

### Payload
```json
{
  "event": "order.confirmed",
  "timestamp": "2025-11-28T12:00:00Z",
  "data": {}
}
```

---

**Maintained By:** Cipta Koding Team
