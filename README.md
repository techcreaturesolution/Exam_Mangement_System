# Exam Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing Practice and Mock exams with a React Native mobile app.

## Features

### Master Admin Panel (React Dashboard)
- **Dashboard** - Overview stats (total exams, questions, attempts)
- **Category Management** - Create/edit/delete exam categories (Practice, Mock, or Both)
- **Subject Management** - Manage subjects under categories
- **Level Management** - Difficulty levels (Easy, Medium, Hard, Expert) with color coding
- **Question Bank** - Add individual questions or bulk upload via Excel/CSV
- **Exam Management** - Create Practice & Mock exams with:
  - Configurable duration/timing
  - Passing percentage
  - Negative marking toggle
  - Question shuffling
  - Max attempts limit
  - Show/hide results & answers
  - Custom instructions

### Mobile App (React Native/Expo)
- **User Registration & Login**
- **Practice Exam Mode** - Practice at your own pace with category-wise questions
- **Mock Exam Mode** - Timed exam simulation with real exam conditions
- **Exam Flow** - Question navigation, timer, progress tracking
- **Results** - Detailed score breakdown (correct, wrong, skipped, time spent)
- **Exam History** - Track all past attempts and progress

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Admin Dashboard | React (Vite), React Router, Axios |
| Mobile App | React Native (Expo) |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer, XLSX parser |

## Project Structure

```
exam-management-system/
├── server/                  # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── seeders/        # Database seeders
│   └── package.json
├── admin/                   # React Admin Dashboard
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
│   └── package.json
├── mobile/                  # React Native Mobile App
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── context/        # Auth context
│   │   └── services/       # API service
│   └── package.json
└── package.json             # Root workspace
```

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn
- Expo CLI (for mobile app)

### 1. Clone & Install

```bash
git clone <repo-url>
cd exam-management-system

# Install server & admin dependencies
npm install

# Install mobile app dependencies
cd mobile && npm install && cd ..
```

### 2. Configure Environment

```bash
# Copy the example env file
cp server/.env.example server/.env

# Edit server/.env with your MongoDB URI
```

**Server `.env` variables:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
```

### 3. Seed Default Data

```bash
cd server && npm run seed
```

This creates:
- **Admin account**: `admin@examportal.com` / `admin123456`
- **Default levels**: Easy, Medium, Hard, Expert

### 4. Start Development

```bash
# From project root - start both server & admin
npm run dev

# Or start individually:
npm run server    # Backend on http://localhost:5000
npm run admin     # Admin panel on http://localhost:5173
```

### 5. Start Mobile App

```bash
cd mobile
npx expo start
```

Scan the QR code with Expo Go app on your phone.

> **Note:** Update the API URL in `mobile/src/services/api.js` to point to your server's IP address instead of `localhost`.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/admin/login` | Admin login |
| GET | `/api/auth/me` | Get current user |

### Categories (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Subjects (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | List subjects |
| POST | `/api/subjects` | Create subject |
| PUT | `/api/subjects/:id` | Update subject |
| DELETE | `/api/subjects/:id` | Delete subject |

### Levels (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/levels` | List levels |
| POST | `/api/levels` | Create level |
| PUT | `/api/levels/:id` | Update level |
| DELETE | `/api/levels/:id` | Delete level |

### Questions (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions` | List questions (paginated) |
| POST | `/api/questions` | Create question |
| PUT | `/api/questions/:id` | Update question |
| DELETE | `/api/questions/:id` | Delete question |
| POST | `/api/questions/bulk-upload` | Bulk upload from Excel/CSV |
| GET | `/api/questions/count` | Get question count by filters |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List exams |
| POST | `/api/exams` | Create exam (Admin) |
| PUT | `/api/exams/:id` | Update exam (Admin) |
| DELETE | `/api/exams/:id` | Delete exam (Admin) |
| GET | `/api/exams/stats` | Dashboard stats (Admin) |
| POST | `/api/exams/:id/start` | Start exam attempt |
| POST | `/api/exams/:id/submit` | Submit exam answers |
| GET | `/api/exams/history` | User's exam history |

## Bulk Upload Format

Upload questions via Excel (.xlsx) or CSV with these columns:

| Column | Required | Description |
|--------|----------|-------------|
| Question | Yes | Question text |
| Option A | Yes | First option |
| Option B | Yes | Second option |
| Option C | Yes | Third option |
| Option D | Yes | Fourth option |
| Correct Answer | Yes | A, B, C, or D |
| Explanation | No | Answer explanation |
| Marks | No | Points (default: 1) |
| Negative Marks | No | Negative marks (default: 0) |

## Default Admin Credentials

```
Email: admin@examportal.com
Password: admin123456
```

> ⚠️ **Change the default password after first login in production!**

## License

MIT
