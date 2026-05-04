# Exam Management System - Multi-Tenant SaaS Platform

A complete exam management platform built with **MERN Stack** (Backend + Admin Dashboard) and **Flutter** (Mobile App) featuring multi-tenant architecture, anti-cheat proctoring, and Razorpay payment integration.

## Architecture

### User Roles
- **Master Admin** (Service Provider): Manages companies, onboards exam conductors, global analytics
- **Company Admin** (Exam Conductor): Creates exams, manages questions, publishes exams for their company
- **Student** (User): Takes practice & mock exams, views results, manages subscriptions

### Tech Stack
| Component | Technology |
|-----------|------------|
| Backend API | Node.js + Express + MongoDB |
| Admin Dashboard | React + Vite |
| Mobile App | **Flutter** (Android & iOS) |
| Payments | Razorpay |
| Auth | JWT Bearer Tokens |

## Project Structure

```
exam-management-system/
├── server/          # Node.js + Express API
│   ├── src/
│   │   ├── models/       # MongoDB models (User, Company, Exam, Question, etc.)
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/    # Auth, company scoping
│   │   └── seeders/      # Database seeder
│   └── uploads/
├── admin/           # React Admin Dashboard
│   └── src/
│       ├── pages/        # Dashboard, Companies, Exams, Questions, etc.
│       ├── components/   # Sidebar, Layout, ProtectedRoute
│       └── services/     # API service
└── mobile/          # Flutter Mobile App
    └── lib/
        ├── screens/      # Login, Home, Exam, Results, etc.
        ├── providers/    # Auth state management
        ├── services/     # API service
        └── constants/    # Theme, API endpoints
```

## Quick Start

### 1. Backend Server
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and Razorpay keys
npm install
npm run seed    # Creates Master Admin + Demo Company
npm run dev
```

**Default Credentials:**
- Master Admin: `admin@examportal.com` / `admin123456`
- Company Admin: `companyadmin@demoacademy.com` / `admin123456`

### 2. Admin Dashboard
```bash
cd admin
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Flutter Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

## Features

### Multi-Tenant Data Scoping
- All data (categories, subjects, questions, exams) is scoped to companies
- Company admins can only see their own company's data
- Master admin has global visibility with optional company filtering

### Anti-Cheat / Proctoring
| Feature | Description |
|---------|-------------|
| Screenshot Prevention | Disables screenshots during exam using `no_screenshot` plugin |
| App Switch Detection | Detects when user switches to another app via `WidgetsBindingObserver` |
| Screen Share Prevention | Blocks screen sharing during active exams |
| Violation Tracking | All violations logged with type, timestamp, user, exam |
| Auto-Submit | Exam auto-submits after configurable max violations |
| Warning System | Visual warnings shown to student with violation count |

### Payment Integration (Razorpay)
- Plan types: All Access, Category, Subject, Exam-level
- Payment verification via Razorpay signature
- Subscription tracking with expiry
- Per-company Razorpay configuration

### Admin Dashboard
- **Master Admin**: Company management (CRUD), global stats, plan management, admin onboarding
- **Company Admin**: Exam creation, question bank, user management, violation logs, reports

### Mobile App (Flutter)
- TestBharti design (Navy #1E3A6E + Orange #E87722)
- Bottom navigation: Home, Practice, Tests, Me
- Practice & Mock exam modes with timer
- Question navigation dots, flagging, progress bar
- Score circle with detailed results
- Exam history, analytics, subscriptions, settings

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration (with optional company code)
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login (master_admin or admin)

### Companies (Master Admin only)
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company (with optional initial admin)
- `GET /api/companies/stats/overview` - Platform statistics
- `GET /api/companies/:id/admins` - Company admins
- `POST /api/companies/:id/admins` - Add company admin

### Exams
- `GET /api/exams` - List exams (company-scoped)
- `POST /api/exams` - Create exam with anti-cheat config
- `POST /api/exams/:id/start` - Start exam attempt
- `POST /api/exams/:id/submit` - Submit answers

### Violations
- `POST /api/violations` - Report violation during exam
- `GET /api/violations` - View violations (admin, company-scoped)

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_management
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
