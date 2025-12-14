# دليل إعداد Vercel - بالعربية

## المشكلة الحالية
عند محاولة تسجيل الدخول على Vercel، تظهر أخطاء:
- `Failed to load resource: net::ERR_CONNECTION_REFUSED`
- `404 errors`

## السبب
التطبيق يحاول الاتصال بـ `localhost:5000` بينما الـ backend غير موجود على Vercel.

## الحل

### الخطوة 1: رفع الـ Backend على خدمة منفصلة

Vercel مناسب للـ frontend فقط. يجب رفع الـ backend على خدمة أخرى مثل:

#### خيار 1: Railway (موصى به - مجاني)
1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول بـ GitHub
3. New Project → Deploy from GitHub repo
4. اختر مجلد `server`
5. Railway سيرفع الـ backend تلقائياً
6. احصل على URL (مثل: `https://your-app.railway.app`)

#### خيار 2: Render
1. اذهب إلى [render.com](https://render.com)
2. New → Web Service
3. اربط GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm run dev` أو `node dist/index.js`

#### خيار 3: Heroku
1. ارفع الـ backend على Heroku
2. احصل على URL

### الخطوة 2: إضافة Environment Variable في Vercel

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. Settings → Environment Variables
4. أضف متغير جديد:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.com/api` (URL الـ backend الذي حصلت عليه)
   - **Environment:** Production, Preview, Development (اختر الكل)
5. احفظ

### الخطوة 3: إعداد CORS في الـ Backend

تأكد من أن الـ backend يسمح بـ requests من Vercel domain:

في `server/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));image.png
```

أضف `FRONTEND_URL` في environment variables للـ backend:
- `FRONTEND_URL=https://your-vercel-app.vercel.app`

### الخطوة 4: إعادة النشر

1. في Vercel Dashboard → Deployments
2. اضغط على "Redeploy" أو ادفع commit جديد إلى GitHub
3. Vercel سيعيد البناء مع Environment Variables الجديدة

## التحقق من الإعداد

بعد النشر:
1. افتح تطبيق Vercel
2. حاول تسجيل الدخول
3. يجب أن يعمل الآن!

## ملاحظات مهمة

1. **Environment Variables** في Vercel تبدأ بـ `VITE_` لتكون متاحة في الكود
2. **CORS** يجب أن يكون مضبوطاً في الـ backend
3. **URL** يجب أن ينتهي بـ `/api` (مثل: `https://backend.railway.app/api`)

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من Console:**
   - افتح Developer Tools (F12)
   - اذهب إلى Console
   - ابحث عن أخطاء API

2. **تحقق من Network:**
   - Developer Tools → Network
   - حاول تسجيل الدخول
   - تحقق من requests إلى API

3. **تحقق من Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - تأكد من وجود `VITE_API_URL`

4. **تحقق من Backend:**
   - تأكد من أن الـ backend يعمل
   - جرب الوصول إلى `https://your-backend-url.com/api/auth/login` مباشرة

## مثال كامل

إذا كان:
- **Frontend:** `https://testschool-snowy.vercel.app`
- **Backend:** `https://school-backend.railway.app`

في Vercel Environment Variables:
```
VITE_API_URL = https://school-backend.railway.app/api
```

في Backend Environment Variables (Railway):
```
FRONTEND_URL = https://testschool-snowy.vercel.app
```

