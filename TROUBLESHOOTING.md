# حل مشاكل تسجيل الدخول

## ✅ قاعدة البيانات جاهزة!

تم التحقق من قاعدة البيانات والبيانات الافتراضية موجودة:
- ✅ Admin: admin@school.com / admin123
- ✅ Teacher: teacher1@school.com / teacher123
- ✅ Student: student1@school.com / student123
- ✅ Parent: parent1@school.com / parent123

## 🔍 خطوات التحقق:

### 1. تأكد من أن الـ Server شغال:

```bash
cd server
npm run dev
```

يجب أن ترى:
```
✅ Supabase database connected successfully!
Server running on http://localhost:5000
```

### 2. تأكد من أن الـ Client شغال:

```bash
cd client
npm run dev
```

يجب أن يفتح على `http://localhost:3000`

### 3. تحقق من Console في المتصفح:

افتح Developer Tools (F12) → Console
- إذا رأيت أخطاء API، تحقق من أن Server يعمل
- إذا رأيت "Network Error"، Server غير شغال

### 4. جرب تسجيل الدخول:

استخدم:
- **Email**: `admin@school.com`
- **Password**: `admin123`

## 🐛 المشاكل الشائعة:

### المشكلة 1: "Invalid credentials"
**الحل**: تأكد من:
- استخدام البريد الإلكتروني والكلمة الصحيحة
- لا توجد مسافات إضافية في البريد أو الكلمة

### المشكلة 2: "Network Error" أو "Cannot connect"
**الحل**: 
- تأكد من أن Server يعمل على `http://localhost:5000`
- تحقق من Console في Server للأخطاء

### المشكلة 3: "Server error"
**الحل**:
- افتح Console في Server
- ابحث عن الأخطاء الحمراء
- تأكد من أن ملف `.env` موجود في `server/`

### المشكلة 4: صفحة بيضاء أو لا شيء يحدث
**الحل**:
- افتح Developer Tools (F12)
- اذهب إلى Console
- ابحث عن الأخطاء
- اذهب إلى Network tab وتحقق من طلبات API

## 🔧 اختبار مباشر:

افتح Terminal جديد وجرب:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

أو في PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@school.com","password":"admin123"}'
```

إذا حصلت على token، Server يعمل بشكل صحيح.

## 📞 إذا استمرت المشكلة:

أرسل لي:
1. رسالة الخطأ من Console (في المتصفح)
2. رسالة الخطأ من Server Terminal
3. لقطة شاشة من صفحة تسجيل الدخول

