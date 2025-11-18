# دليل النشر على Vercel

## المشاكل الشائعة وحلولها

### 1. خطأ 404 عند تسجيل الدخول

**السبب:** التطبيق يحاول الاتصال بـ `localhost:5000` بينما الـ backend غير موجود على Vercel.

**الحل:**

#### خيار 1: رفع الـ Backend على Vercel (Serverless Functions)
- قم بتحويل الـ backend إلى Vercel Serverless Functions
- أو استخدم خدمة أخرى مثل Railway, Render, أو Heroku للـ backend

#### خيار 2: استخدام Environment Variable
1. في Vercel Dashboard → Settings → Environment Variables
2. أضف:
   - `VITE_API_URL` = `https://your-backend-url.com/api`
3. أعد نشر التطبيق

#### خيار 3: استخدام Backend منفصل
- ارفع الـ backend على خدمة منفصلة (Railway, Render, etc.)
- أضف `VITE_API_URL` في Vercel environment variables

### 2. خطأ PWA Icons

**السبب:** ملفات الأيقونات غير موجودة.

**الحل:** تم إصلاحه في `vite.config.ts` لاستخدام favicon.ico فقط.

### 3. إعدادات Vercel المطلوبة

#### في Vercel Dashboard:
- **Root Directory:** `client`
- **Build Command:** `npm run build` (أو اتركه فارغاً)
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables:
- `VITE_API_URL` = رابط الـ API الخاص بك

## ملاحظات مهمة

1. **الـ Backend يجب أن يكون منفصلاً** - Vercel مناسب للـ frontend فقط
2. **CORS:** تأكد من إعداد CORS في الـ backend للسماح بـ Vercel domain
3. **Environment Variables:** جميع المتغيرات التي تبدأ بـ `VITE_` متاحة في الكود

## مثال على إعداد Backend على Railway/Render

1. ارفع مجلد `server` على Railway أو Render
2. احصل على URL (مثل: `https://your-app.railway.app`)
3. في Vercel → Environment Variables:
   - `VITE_API_URL` = `https://your-app.railway.app/api`

