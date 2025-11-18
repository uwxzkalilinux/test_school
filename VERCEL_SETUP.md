# إعداد Vercel - خطوات مهمة

## المشكلة
Vercel يحاول تشغيل `tsc` لكنه غير موجود في PATH.

## الحل

### الطريقة 1: استخدام Root Directory في Vercel Dashboard (موصى به)

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. اذهب إلى Settings → General
4. في قسم "Root Directory"، اضغط على "Edit"
5. أدخل: `client`
6. احفظ التغييرات

### الطريقة 2: التأكد من تحديث الملفات

تأكد من أن `client/package.json` يحتوي على:
```json
"build": "vite build"
```

وليس:
```json
"build": "tsc && vite build"
```

### الطريقة 3: استخدام vercel.json

الملف `vercel.json` موجود في المجلد الجذر، لكن يجب تعيين Root Directory في Dashboard أولاً.

## بعد التحديث

1. تأكد من push جميع التغييرات إلى GitHub
2. في Vercel Dashboard:
   - Root Directory: `client`
   - Build Command: `npm run build` (أو اتركه فارغاً ليستخدم من package.json)
   - Output Directory: `dist`
   - Install Command: `npm install`

## ملاحظة
إذا استمرت المشكلة، احذف build cache في Vercel Dashboard:
Settings → General → Clear Build Cache

