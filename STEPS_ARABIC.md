# الخطوات المطلوبة - بالعربية

## ✅ ما تم إنجازه (أنا عملته):

1. ✅ تثبيت Supabase Client
2. ✅ إنشاء Supabase Database Adapter (كل الدوال)
3. ✅ تحديث جميع Routes لاستخدام Supabase:
   - auth.ts
   - users.ts
   - classes.ts
   - subjects.ts
   - teachers.ts
   - students.ts
   - attendance.ts
   - grades.ts
   - assignments.ts
   - announcements.ts
   - messages.ts
   - timetable.ts
4. ✅ إنشاء ملف `.env.example` مع جميع الإعدادات

## 📝 الخطوات المطلوبة منك (3 خطوات فقط):

### الخطوة 1: إنشاء ملف `.env` في مجلد `server/`

1. افتح مجلد `server/`
2. انسخ ملف `.env.example` وسميه `.env`
3. أو أنشئ ملف جديد اسمه `.env` وانسخ المحتوى من `.env.example`

**المحتوى:**
```env
SUPABASE_URL=https://ggxqghqxjyrtnbihnsmm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5NDg2NSwiZXhwIjoyMDgxMjcwODY1fQ.tLo2xeERD_ioV5xMp-jqZX67bcJxsHpl81E1oPzdyz0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2OTQ4NjUsImV4cCI6MjA4MTI3MDg2NX0.It2jXUNPX91rMwqjLQk0CNx_sV17OBCxZPWMfj7guUQ
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### الخطوة 2: تشغيل SQL Schema في Supabase

1. افتح [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **SQL Editor** (في القائمة الجانبية)
4. اضغط **New Query**
5. افتح ملف `supabase_schema.sql` من المشروع
6. انسخ **كل** محتوى الملف والصقه في SQL Editor
7. اضغط **Run** أو `Ctrl+Enter`
8. انتظر حتى ترى رسالة "Success" ✅

### الخطوة 3: تجربة النظام

1. شغل الـ Server:
```bash
cd server
npm run dev
```

2. شغل الـ Client (في terminal آخر):
```bash
cd client
npm run dev
```

3. افتح المتصفح على `http://localhost:3000`

4. جرب تسجيل الدخول:
   - **Admin**: `admin@school.com` / `admin123`
   - **Teacher**: `teacher1@school.com` / `teacher123`
   - **Student**: `student1@school.com` / `student123`
   - **Parent**: `parent1@school.com` / `parent123`

## 🎉 انتهى!

إذا واجهت أي مشاكل، أخبرني وسأصلحها.

## 📋 ملاحظات:

- جميع البيانات الآن في Supabase (ليس في ملف JSON)
- يمكنك رؤية البيانات في Supabase Dashboard → Table Editor
- النظام جاهز للرفع على Vercel/Railway بعد إضافة Environment Variables

