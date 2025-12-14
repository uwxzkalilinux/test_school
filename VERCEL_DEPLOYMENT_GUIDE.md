# دليل رفع التطبيق على Vercel - كامل

## 📋 المتطلبات:

1. ✅ Frontend على Vercel (تم)
2. ⏳ Backend على Railway أو Render (يجب رفعه)
3. ⏳ إضافة Environment Variables في Vercel

---

## 🚀 الخطوة 1: رفع Backend على Railway

### أ) إنشاء حساب على Railway:
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول بـ GitHub
3. اضغط "New Project"
4. اختر "Deploy from GitHub repo"

### ب) رفع Backend:
1. اختر Repository الخاص بك
2. في "Root Directory" أدخل: `server`
3. Railway سيكتشف Node.js تلقائياً
4. اضغط "Deploy"

### ج) إضافة Environment Variables في Railway:
1. اذهب إلى Settings → Variables
2. أضف هذه المتغيرات:

```
SUPABASE_URL=https://ggxqghqxjyrtnbihnsmm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5NDg2NSwiZXhwIjoyMDgxMjcwODY1fQ.tLo2xeERD_ioV5xMp-jqZX67bcJxsHpl81E1oPzdyz0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2OTQ4NjUsImV4cCI6MjA8MTI3MDg2NX0.It2jXUNPX91rMwqjLQk0CNx_sV17OBCxZPWMfj7guUQ
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### د) الحصول على Backend URL:
1. بعد الرفع، اذهب إلى Settings → Networking
2. اضغط "Generate Domain"
3. ستحصل على رابط مثل: `https://your-app.up.railway.app`
4. **احفظ هذا الرابط** - ستحتاجه في الخطوة التالية

---

## 🌐 الخطوة 2: إضافة Environment Variables في Vercel

### أ) في Vercel Dashboard:
1. اذهب إلى مشروعك في [vercel.com](https://vercel.com)
2. اضغط على Settings
3. اذهب إلى Environment Variables

### ب) أضف هذه المتغيرات:

**Name**: `VITE_API_URL`  
**Value**: `https://your-app.up.railway.app/api`  
(استبدل `your-app.up.railway.app` بالرابط الفعلي من Railway)

**ملاحظة**: تأكد من إضافة `/api` في النهاية!

### ج) Redeploy:
1. بعد إضافة المتغيرات، اذهب إلى Deployments
2. اضغط على الثلاث نقاط (⋯) بجانب آخر deployment
3. اختر "Redeploy"
4. أو ادفع أي تغيير إلى GitHub (سيحدث redeploy تلقائياً)

---

## 🔧 الخطوة 3: تحديث CORS في Backend

### في Railway:
1. اذهب إلى Settings → Variables
2. أضف أو حدث:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

(استبدل `your-vercel-app.vercel.app` برابط Vercel الفعلي)

---

## ✅ التحقق:

بعد Redeploy:
1. افتح موقع Vercel
2. يجب أن تختفي رسالة الخطأ
3. جرب تسجيل الدخول

---

## 🐛 إذا استمرت المشكلة:

### تحقق من:
1. ✅ `VITE_API_URL` موجود في Vercel Environment Variables
2. ✅ القيمة صحيحة وتنتهي بـ `/api`
3. ✅ Backend يعمل على Railway (افتح الرابط في المتصفح)
4. ✅ CORS مضبوط في Backend (FRONTEND_URL = رابط Vercel)

### اختبار Backend مباشرة:
افتح في المتصفح:
```
https://your-app.up.railway.app/api/auth/login
```

يجب أن ترى رسالة خطأ JSON (هذا طبيعي - يعني Backend يعمل)

### اختبار من Vercel:
افتح Console في المتصفح (F12) وتحقق من:
- لا توجد أخطاء CORS
- طلبات API تذهب إلى الرابط الصحيح

---

## 📝 ملخص المتغيرات:

### في Railway (Backend):
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### في Vercel (Frontend):
```
VITE_API_URL=https://your-app.up.railway.app/api
```

---

## 🎉 انتهى!

بعد إكمال هذه الخطوات، يجب أن يعمل التطبيق بشكل كامل!

