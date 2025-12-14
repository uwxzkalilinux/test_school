# دليل تحديث Routes لاستخدام Supabase

تم تحديث `auth.ts` لاستخدام Supabase. باقي Routes تحتاج إلى تحديث مشابه.

## التغييرات المطلوبة في كل Route:

### 1. استبدال الـ imports:
```typescript
// القديم:
import { getDatabase, saveDatabase } from '../database/index.js';

// الجديد:
import { supabaseDb } from '../database/index.js';
```

### 2. استبدال العمليات:

#### القراءة:
```typescript
// القديم:
const db = getDatabase();
const users = db.users;

// الجديد:
const users = await supabaseDb.getUsers();
```

#### الإضافة:
```typescript
// القديم:
db.users.push(newUser);
saveDatabase();

// الجديد:
const newUser = await supabaseDb.createUser({ ... });
```

#### التحديث:
```typescript
// القديم:
const user = db.users.find(u => u.id === id);
user.name = newName;
saveDatabase();

// الجديد:
const updatedUser = await supabaseDb.updateUser(id, { name: newName });
```

#### الحذف:
```typescript
// القديم:
db.users = db.users.filter(u => u.id !== id);
saveDatabase();

// الجديد:
await supabaseDb.deleteUser(id);
```

## Routes المحدثة:
- ✅ `auth.ts` - تم التحديث

## Routes المتبقية (تحتاج تحديث):
- ⏳ `users.ts`
- ⏳ `classes.ts`
- ⏳ `subjects.ts`
- ⏳ `teachers.ts`
- ⏳ `students.ts`
- ⏳ `attendance.ts`
- ⏳ `grades.ts`
- ⏳ `assignments.ts`
- ⏳ `announcements.ts`
- ⏳ `messages.ts`
- ⏳ `timetable.ts`

## ملاحظات:
- جميع دوال `supabaseDb` هي async - استخدم `await`
- أضف `try/catch` لكل route handler
- استخدم `res.status(500).json({ error: error.message })` للأخطاء

