# إنشاء ملف .env

## الخطوة المهمة:

في مجلد `server/`، أنشئ ملف جديد اسمه `.env` (بدون أي شيء قبل النقطة)

## محتوى الملف:

انسخ والصق هذا المحتوى بالضبط:

```
SUPABASE_URL=https://ggxqghqxjyrtnbihnsmm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5NDg2NSwiZXhwIjoyMDgxMjcwODY1fQ.tLo2xeERD_ioV5xMp-jqZX67bcJxsHpl81E1oPzdyz0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2OTQ4NjUsImV4cCI6MjA4MTI3MDg2NX0.It2jXUNPX91rMwqjLQk0CNx_sV17OBCxZPWMfj7guUQ
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## طريقة الإنشاء:

### في VS Code:
1. افتح مجلد `server/`
2. اضغط بزر الماوس الأيمن → New File
3. اكتب `.env` (مع النقطة في البداية)
4. انسخ المحتوى أعلاه والصقه
5. احفظ الملف

### في Windows Explorer:
1. افتح مجلد `server/`
2. File → New → Text Document
3. سميه `.env` (مع النقطة في البداية)
4. إذا طلب منك تأكيد تغيير الامتداد، اضغط Yes
5. افتح الملف وانسخ المحتوى أعلاه

## بعد الإنشاء:

شغل الـ server مرة أخرى:
```bash
cd server
npm run dev
```

يجب أن يعمل الآن! ✅

