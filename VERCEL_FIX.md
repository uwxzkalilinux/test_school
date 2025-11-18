# إصلاح خطأ "Error creating build plan with Railpack"

## المشكلة
Vercel لا يستطيع تحديد كيفية بناء المشروع ويحاول استخدام Railpack (وهو نظام بناء خاص) لكنه يفشل.

## الحل

### الطريقة 1: استخدام vercel.json (موصى به)

تم تحديث `vercel.json` في المجلد الجذر ليشمل:
- `rootDirectory`: `client` (أو يمكن تعيينه في Dashboard)
- `buildCommand`: `cd client && npm install && npm run build`
- `outputDirectory`: `client/dist`
- `framework`: `vite`

### الطريقة 2: إعداد Root Directory في Vercel Dashboard

إذا استمرت المشكلة:

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. Settings → General
4. في قسم "Root Directory":
   - اضغط على "Edit"
   - أدخل: `client`
   - احفظ

5. في قسم "Build & Development Settings":
   - Build Command: `npm install && npm run build` (أو اتركه فارغاً)
   - Output Directory: `dist`
   - Install Command: `npm install`

### الطريقة 3: حذف vercel.json والاعتماد على Auto-detection

إذا لم تعمل الطرق السابقة:

1. احذف `vercel.json` من المجلد الجذر
2. في Vercel Dashboard:
   - Root Directory: `client`
   - Build Command: اتركه فارغاً (Vercel سيكتشف Vite تلقائياً)
   - Output Directory: `dist`

## التحقق

بعد التحديث:
1. ادفع التغييرات إلى GitHub
2. Vercel سيعيد البناء تلقائياً
3. تحقق من أن البناء نجح

## ملاحظات

- تأكد من أن `client/package.json` يحتوي على `"build": "vite build"`
- تأكد من أن جميع dependencies موجودة في `client/package.json`
- إذا استمرت المشكلة، تحقق من Logs في Vercel Dashboard

