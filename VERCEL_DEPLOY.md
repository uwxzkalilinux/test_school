# إعداد Vercel للنشر

## الإعدادات المطلوبة

### 1. Root Directory
في إعدادات Vercel، قم بتعيين:
- **Root Directory**: `client`

### 2. Build Command
```
npm run build
```

### 3. Output Directory
```
dist
```

### 4. Install Command
```
npm install
```

### 5. Environment Variables
إذا كنت تحتاج إلى متغيرات بيئة، أضفها في إعدادات Vercel:
- `VITE_API_URL` - رابط API الخاص بك

## ملاحظات
- تأكد من أن جميع dependencies مثبتة في `client/package.json`
- Vite يقوم ببناء التطبيق تلقائياً بدون الحاجة لـ `tsc`
- تأكد من أن `vercel.json` موجود في المجلد الجذر

