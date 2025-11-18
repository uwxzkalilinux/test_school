# School Management System

A complete School Management Web Application with role-based access control for Admin, Teachers, Students, and Parents.

## Features

### 🎯 Core Features

- **User Management**: Four user roles (Admin, Teacher, Student, Parent) with role-based access
- **Attendance System**: Teachers can mark attendance, students and parents can view records
- **Grades & Assessments**: Teachers add scores, students and parents track progress
- **Assignments/Homework**: Create assignments, submit work, and grade submissions
- **Announcements**: Role-based announcements system
- **Messaging**: Internal communication system (coming soon)
- **Class & Subject Management**: Admin manages classes and subjects
- **Timetable Management**: Weekly schedules for classes
- **File Storage**: Upload and manage documents

### 🎨 UI Features

- Modern, responsive design
- Dark mode support
- Smooth animations
- PWA support (add to home screen)
- Role-based dashboards

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (icons)
- date-fns

### Backend
- Node.js with Express
- TypeScript
- JSON-based database (easily replaceable with MongoDB/PostgreSQL)
- JWT authentication
- Multer for file uploads

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:5000

### Default Login

- **Email**: admin@school.com
- **Password**: admin123

## Project Structure

```
school-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── database/      # Database models and logic
│   │   └── middleware/    # Auth middleware
│   └── package.json
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class (Admin)
- `PUT /api/classes/:id` - Update class (Admin)
- `DELETE /api/classes/:id` - Delete class (Admin)

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance (Teacher)
- `POST /api/attendance/bulk` - Bulk mark attendance (Teacher)

### Grades
- `GET /api/grades` - Get grades
- `POST /api/grades` - Add grade (Teacher)
- `PUT /api/grades/:id` - Update grade (Teacher)

### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (Teacher)
- `POST /api/assignments/:id/submit` - Submit assignment (Student)

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message

### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable` - Create timetable entry (Admin)

## Development

### Frontend Development
```bash
cd client
npm run dev
```

### Backend Development
```bash
cd server
npm run dev
```

### Build for Production
```bash
cd client
npm run build
```

## Database

The application uses a JSON-based database stored in `server/data/db.json`. This can be easily replaced with MongoDB, PostgreSQL, or any other database by modifying the database layer in `server/src/database/index.ts`.

## License

MIT

