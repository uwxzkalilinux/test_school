# Quick Start Guide

## Installation & Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This starts both frontend (port 3000) and backend (port 5000) concurrently.

## First Login

Use the default admin account:
- **Email**: `admin@school.com`
- **Password**: `admin123`

## Creating Test Data

After logging in as admin, you can:

1. **Create Classes**: Go to Admin → Classes → Add Class
2. **Create Subjects**: Go to Admin → Subjects → Add Subject
3. **Create Users**: Go to Admin → Users → Add User
4. **Create Timetable**: Go to Admin → Timetable → Add Entry

## Features Overview

### Admin Dashboard
- User management
- Class and subject management
- Timetable creation
- School-wide announcements
- Reports and statistics

### Teacher Dashboard
- View schedule
- Mark attendance
- Add grades
- Create assignments
- Post announcements
- Message students/parents

### Student Dashboard
- View grades and attendance
- Submit assignments
- View timetable
- Read announcements
- Message teachers

### Parent Dashboard
- View children's performance
- Track attendance
- Monitor grades
- View assignments
- Read announcements
- Message teachers

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
- Frontend: Change port in `client/vite.config.ts`
- Backend: Change PORT in `server/src/index.ts` or set environment variable

### Database Issues
The database is stored in `server/data/db.json`. If you encounter issues:
- Delete `server/data/db.json` to reset
- The default admin will be recreated on next server start

### File Uploads
Uploaded files are stored in `server/uploads/`. Make sure this directory has write permissions.

## Development Tips

- The frontend hot-reloads automatically
- The backend uses `tsx watch` for auto-reload
- Check browser console and server logs for errors
- Use browser DevTools to inspect API calls

## Next Steps

1. Create test users for each role
2. Set up classes and subjects
3. Create a timetable
4. Test attendance marking
5. Create assignments and test submissions

Enjoy building your school management system! 🎓

