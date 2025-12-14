# إعداد Vercel - دليل سريع

## المشكلة:
ظهرت رسالة: "⚠️ API URL غير مضبوط!"

## الحل (خطوتان):

---

## 🚀 الخطوة 1: رفع Backend على Railway

### أ) إنشاء حساب:
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول بـ GitHub
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر Repository الخاص بك

### ب) إعدادات Railway:
1. في "Root Directory" أدخل: `server`
2. اضغط "Deploy"
3. انتظر حتى يكتمل الرفع (2-3 دقائق)

### ج) إضافة Environment Variables في Railway:
1. اذهب إلى Settings → Variables
2. أضف هذه المتغيرات (انسخ من `server/.env`):

```
SUPABASE_URL=https://ggxqghqxjyrtnbihnsmm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY5NDg2NSwiZXhwIjoyMDgxMjcwODY1fQ.tLo2xeERD_ioV5xMp-jqZX67bcJxsHpl81E1oPzdyz0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdneHFnaHF4anlydG5iaWhuc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2OTQ4NjUsImV4cCI6MjA4MTI3MDg2NX0.It2jXUNPX91rMwqjLQk0CNx_sV17OBCxZPWMfj7guUQ
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

(استبدل `your-vercel-app.vercel.app` برابط Vercel الفعلي)

### د) الحصول على Backend URL:
1. اذهب إلى Settings → Networking
2. اضغط "Generate Domain"
3. ستحصل على رابط مثل: `https://school-app-production.up.railway.app`
4. **احفظ هذا الرابط!**

---

## 🌐 الخطوة 2: إضافة VITE_API_URL في Vercel

### أ) في Vercel Dashboard:
1. اذهب إلى مشروعك في [vercel.com](https://vercel.com)
2. اضغط Settings
3. اذهب إلى Environment Variables
4. اضغط "Add New"

### ب) أضف المتغير:
- **Name**: `VITE_API_URL`
- **Value**: `https://your-app.up.railway.app/api`
  (استبدل `your-app.up.railway.app` بالرابط الفعلي من Railway)
  
**⚠️ مهم**: تأكد من إضافة `/api` في النهاية!

### ج) Redeploy:
1. اذهب إلى Deployments
2. اضغط على الثلاث نقاط (⋯) بجانب آخر deployment
3. اختر "Redeploy"
4. انتظر حتى يكتمل (1-2 دقيقة)

---

## ✅ التحقق:

بعد Redeploy:
1. افتح موقع Vercel
2. يجب أن تختفي رسالة الخطأ ✅
3. جرب تسجيل الدخول

---

## 🐛 إذا استمرت المشكلة:

### تحقق من:
1. ✅ `VITE_API_URL` موجود في Vercel
2. ✅ القيمة صحيحة وتنتهي بـ `/api`
3. ✅ Backend يعمل على Railway (افتح الرابط في المتصفح)
4. ✅ تم Redeploy بعد إضافة المتغير

### اختبار Backend:
افتح في المتصفح:
```
https://your-app.up.railway.app/api/auth/login
```

يجب أن ترى رسالة خطأ JSON (هذا طبيعي - يعني Backend يعمل)

---

## 📝 ملخص:

### في Railway (Backend):
- Root Directory: `server`
- Environment Variables: من `server/.env`
- Backend URL: `https://your-app.up.railway.app`

### في Vercel (Frontend):
- Environment Variable: `VITE_API_URL`
- Value: `https://your-app.up.railway.app/api`

---

## 🎉 انتهى!

بعد إكمال هذه الخطوات، يجب أن يعمل التطبيق بشكل كامل!

