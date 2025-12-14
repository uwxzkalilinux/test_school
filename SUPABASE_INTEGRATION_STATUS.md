# حالة تكامل Supabase

## ✅ ما تم إنجازه:

1. **تثبيت Supabase Client**: تم تثبيت `@supabase/supabase-js` في server
2. **إنشاء Supabase Database Adapter**: ملف `server/src/database/supabase.ts` يحتوي على جميع دوال CRUD
3. **تحديث database/index.ts**: الآن يصدر Supabase بدلاً من JSON
4. **تحديث Routes**:
   - ✅ `auth.ts` - Login, Register, Get Me
   - ✅ `users.ts` - Get, Create, Update, Delete Users

## ⏳ Routes المتبقية (تحتاج تحديث):

يجب تحديث هذه Routes لاستخدام `supabaseDb` بدلاً من `getDatabase()`:

- `classes.ts`
- `subjects.ts`
- `teachers.ts`
- `students.ts`
- `attendance.ts`
- `grades.ts`
- `assignments.ts`
- `announcements.ts`
- `messages.ts`
- `timetable.ts`

## 📝 خطوات التحديث لكل Route:

### 1. استبدال Import:
```typescript
// من:
import { getDatabase, saveDatabase } from '../database/index.js';

// إلى:
import { supabaseDb } from '../database/index.js';
```

### 2. استبدال العمليات:

#### القراءة:
```typescript
// من:
const db = getDatabase();
const items = db.items;

// إلى:
const items = await supabaseDb.getItems();
```

#### الإضافة:
```typescript
// من:
db.items.push(newItem);
saveDatabase();

// إلى:
const newItem = await supabaseDb.createItem({ ... });
```

#### التحديث:
```typescript
// من:
const item = db.items.find(i => i.id === id);
item.name = newName;
saveDatabase();

// إلى:
const updatedItem = await supabaseDb.updateItem(id, { name: newName });
```

#### الحذف:
```typescript
// من:
db.items = db.items.filter(i => i.id !== id);
saveDatabase();

// إلى:
await supabaseDb.deleteItem(id);
```

## 🔧 الإعدادات المطلوبة:

### 1. إنشاء ملف `.env` في `server/`:
```env
SUPABASE_URL=https://ggxqghqxjyrtnbihnsmm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 2. التأكد من تشغيل SQL Schema:
- افتح Supabase Dashboard
- اذهب إلى SQL Editor
- انسخ محتوى `supabase_schema.sql`
- شغله

## 🧪 الاختبار:

بعد تحديث جميع Routes:

1. شغل الـ server:
```bash
cd server
npm run dev
```

2. جرب Login:
```bash
POST http://localhost:5000/api/auth/login
{
  "email": "admin@school.com",
  "password": "admin123"
}
```

3. تحقق من البيانات في Supabase Dashboard → Table Editor

## 📚 المراجع:

- `server/src/database/supabase.ts` - جميع دوال Supabase
- `SUPABASE_MIGRATION.md` - دليل التحديث
- `supabase_schema.sql` - SQL Schema

## ⚠️ ملاحظات:

- جميع دوال `supabaseDb` هي async - استخدم `await`
- أضف `try/catch` لكل route handler
- استخدم `res.status(500).json({ error: error.message })` للأخطاء
- Supabase يستخدم UUIDs - لا حاجة لإنشاء IDs يدوياً

