# دليل إعداد Supabase - بالعربية

## الخطوة 1: إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. اضغط على "New Project"
4. املأ المعلومات:
   - **Project Name**: school-management (أو أي اسم تريده)
   - **Database Password**: اختر كلمة مرور قوية واحفظها
   - **Region**: اختر أقرب منطقة لك
5. اضغط "Create new project" وانتظر حتى يكتمل الإعداد (دقيقتين تقريباً)

## الخطوة 2: تشغيل SQL Schema

1. في Dashboard، اذهب إلى **SQL Editor** (في القائمة الجانبية)
2. اضغط على **New Query**
3. افتح ملف `supabase_schema.sql` من المشروع
4. انسخ **كل** محتوى الملف والصقه في SQL Editor
5. اضغط **Run** أو `Ctrl+Enter`
6. انتظر حتى يكتمل التنفيذ (يجب أن ترى رسالة "Success")

## الخطوة 3: الحصول على Connection Details

1. اذهب إلى **Settings** → **API**
2. ستحتاج إلى:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: مفتاح يبدأ بـ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: مفتاح يبدأ بـ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ سري جداً)

3. اذهب إلى **Settings** → **Database**
4. ستحتاج إلى:
   - **Connection string**: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - أو استخدام:
     - **Host**: `db.xxxxx.supabase.co`
     - **Database**: `postgres`
     - **User**: `postgres`
     - **Password**: كلمة المرور التي اخترتها عند إنشاء المشروع

## الخطوة 4: إرسال البيانات لي

أرسل لي المعلومات التالية (يمكنك حفظها في ملف نصي أو إرسالها مباشرة):

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Database Password: [كلمة المرور]
Connection String: postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## التحقق من الإعداد

بعد تشغيل SQL، تأكد من:
1. اذهب إلى **Table Editor** في Dashboard
2. يجب أن ترى جميع الجداول:
   - users
   - classes
   - subjects
   - teachers
   - students
   - attendance
   - grades
   - assignments
   - submissions
   - announcements
   - messages
   - timetable

3. تحقق من وجود البيانات الافتراضية:
   - Admin: `admin@school.com` / `admin123`
   - Teachers: `teacher1@school.com`, `teacher2@school.com`, `teacher3@school.com` / `teacher123`
   - Students: `student1@school.com`, `student2@school.com`, إلخ / `student123`
   - Parent: `parent1@school.com` / `parent123`

## ملاحظات أمنية

⚠️ **مهم جداً**:
- **Service Role Key** لديه صلاحيات كاملة - لا تشاركه أبداً في الكود المكشوف
- **Anon Key** آمن للاستخدام في Frontend
- **Database Password** يجب أن تبقى سرية

## بعد الحصول على البيانات

بمجرد أن ترسل لي البيانات، سأقوم بـ:
1. تثبيت `@supabase/supabase-js` في Backend و Frontend
2. تعديل الكود لاستخدام Supabase بدلاً من JSON
3. إنشاء ملفات `.env` للإعدادات
4. اختبار كل شيء والعمل على الإصلاحات إن لزم الأمر

