# 📝 Exam Management System — Frontend Developer API Guide

> **Version:** 1.0.0  
> **Last Updated:** April 23, 2026  
> **Backend Stack:** Node.js, Express.js, MongoDB, JWT Auth, Razorpay  

---

## 📑 Table of Contents

1. [Getting Started](#-getting-started)
2. [Base URL & Swagger UI](#-base-url--swagger-ui)
3. [Authentication Guide](#-authentication-guide)
4. [Axios Setup (Copy-Paste Ready)](#-axios-setup-copy-paste-ready)
5. [User Roles & Permissions](#-user-roles--permissions)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Error Handling Guide](#-error-handling-guide)

---

## 🚀 Getting Started

### Prerequisites
- Backend server must be running (`npm run dev`)
- Node.js installed
- REST client (Postman or Swagger UI)

---

## 🌐 Base URL & Swagger UI

| Resource | URL |
|----------|-----|
| **API Base URL** | `https://exammanagementsystem-3crf.onrender.com/api` |
| **Swagger UI** | `https://exammanagementsystem-3crf.onrender.com/api-docs` |

---

## 🔐 Authentication Guide

### How to Send the Token
Include the token in the `Authorization` header with the `Bearer` prefix:

```http
Authorization: Bearer <your-jwt-token>
```

---

## ⚡ Axios Setup (Copy-Paste Ready)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://exammanagementsystem-3crf.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 👥 User Roles & Permissions

| Role | Access Level |
|------|--------------|
| **Admin** | Full system access (Manage Users, Exams, Questions, Master Data) |
| **Student** | Take Exams, View History, Manage Profile |

---

## 📡 API Endpoints Reference

### 1️⃣ Authentication APIs
- `POST /api/auth/register` - Create student account
- `POST /api/auth/login` - Get token
- `GET /api/auth/me` - Get current profile

### 2️⃣ Exam Workflow
1. `GET /api/exams` - Browse available exams
2. `POST /api/exams/:id/start` - Create an attempt session
3. `POST /api/exams/:id/submit` - Submit answers and get results

### 3️⃣ Admin Features
- Manage questions via `POST /api/questions`
- Import bulk questions via `POST /api/questions/import` (uses `multipart/form-data`)

---

## ❌ Error Handling Guide

| Status | Meaning |
|--------|---------|
| 400 | Bad Request (Check your input fields) |
| 401 | Unauthorized (Token missing or expired) |
| 403 | Forbidden (Insufficient permissions) |
| 404 | Not Found (Resource doesn't exist) |

---
*For technical support, contact the system administrator.*
