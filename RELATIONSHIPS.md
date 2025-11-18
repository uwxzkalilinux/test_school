# العلاقات في النظام (Database Relationships)

تم ربط جميع العناصر في النظام بشكل كامل:

## 📊 هيكل العلاقات

### 1. المستخدمون (Users)
- كل مستخدم له دور: `admin`, `teacher`, `student`, `parent`
- المستخدمون مرتبطون بسجلاتهم الخاصة:
  - **الطلاب** → `students` table
  - **المعلمون** → `teachers` table
  - **أولياء الأمور** → `parentOf` array في users

### 2. الطلاب (Students)
- مرتبطون بـ `users` عبر `userId`
- مرتبطون بـ `classes` عبر `classId`
- مرتبطون بـ `parents` عبر `parentId`
- كل طالب له `studentId` فريد

**العلاقات:**
```
Student → Class (classId)
Student → User (userId)
Student → Parent (parentId)
Class → Students[] (studentIds array)
```

### 3. المعلمون (Teachers)
- مرتبطون بـ `users` عبر `userId`
- مرتبطون بـ `subjects` عبر `subjectIds` array
- مرتبطون بـ `classes` عبر المواد التي يدرسونها

**العلاقات:**
```
Teacher → User (userId)
Teacher → Subjects[] (subjectIds array)
Subject → Teacher (teacherId)
Class → Teachers[] (teacherIds array - من خلال المواد)
```

### 4. الصفوف (Classes)
- تحتوي على `studentIds` array (جميع الطلاب في الصف)
- تحتوي على `teacherIds` array (جميع المعلمين الذين يدرسون في الصف)
- مرتبطة بـ `subjects` عبر `classIds` في كل مادة

**العلاقات:**
```
Class → Students[] (studentIds array)
Class → Teachers[] (teacherIds array)
Subject → Classes[] (classIds array)
```

### 5. المواد (Subjects)
- مرتبطة بـ `teacher` عبر `teacherId`
- مرتبطة بـ `classes` عبر `classIds` array
- عند إضافة مادة لصف، يتم ربط المعلم بالصف تلقائياً

**العلاقات:**
```
Subject → Teacher (teacherId)
Subject → Classes[] (classIds array)
Teacher → Subjects[] (subjectIds array)
Class → Subjects[] (من خلال classIds في كل مادة)
```

### 6. الحضور (Attendance)
- مرتبط بـ `student` عبر `studentId`
- مرتبط بـ `subject` عبر `subjectId`
- مرتبط بـ `class` عبر `classId`
- مرتبط بـ `teacher` عبر `markedBy`

**العلاقات:**
```
Attendance → Student (studentId)
Attendance → Subject (subjectId)
Attendance → Class (classId)
Attendance → Teacher (markedBy)
```

### 7. الدرجات (Grades)
- مرتبطة بـ `student` عبر `studentId`
- مرتبطة بـ `subject` عبر `subjectId`
- مرتبطة بـ `teacher` عبر `teacherId`

**العلاقات:**
```
Grade → Student (studentId)
Grade → Subject (subjectId)
Grade → Teacher (teacherId)
```

### 8. الواجبات (Assignments)
- مرتبطة بـ `subject` عبر `subjectId`
- مرتبطة بـ `teacher` عبر `createdBy`
- مرتبطة بـ `submissions` عبر `assignmentId`

**العلاقات:**
```
Assignment → Subject (subjectId)
Assignment → Teacher (createdBy)
Submission → Assignment (assignmentId)
Submission → Student (studentId)
```

### 9. الإعلانات (Announcements)
- مرتبطة بـ `user` عبر `postedBy`
- يمكن استهداف: `all`, `class`, `subject`, `role`
- `targetIds` يحتوي على IDs الصفوف/المواد/الأدوار المستهدفة

### 10. الرسائل (Messages)
- مرتبطة بـ `users` عبر `fromUser` و `toUser`
- يمكن أن تكون جماعية عبر `groupId` و `groupType`

## 🔄 التحديثات التلقائية

عند إضافة/تحديث/حذف:

1. **إضافة طالب لصف:**
   - يتم إضافته تلقائياً إلى `class.studentIds`

2. **إضافة مادة:**
   - يتم ربطها بالمعلم (`teacher.subjectIds`)
   - يتم ربط المعلم بالصفوف (`class.teacherIds`)

3. **تحديث مادة:**
   - عند تغيير المعلم، يتم تحديث `teacher.subjectIds` تلقائياً
   - عند تغيير الصفوف، يتم تحديث `class.teacherIds` تلقائياً

4. **حذف طالب:**
   - يتم حذفه من `class.studentIds`
   - يتم حذف جميع الحضور والدرجات والواجبات المرتبطة

5. **حذف معلم:**
   - يتم حذفه من `class.teacherIds` في جميع الصفوف
   - يتم حذف جميع المواد المرتبطة

6. **حذف صف:**
   - يتم إزالته من `subject.classIds` في جميع المواد
   - يتم حذف جميع الجداول المرتبطة

7. **حذف مادة:**
   - يتم حذفها من `teacher.subjectIds`
   - يتم حذف جميع الحضور والدرجات والواجبات المرتبطة

## ✅ التحقق من العلاقات

جميع العلاقات يتم التحقق منها تلقائياً عند:
- إنشاء سجلات جديدة
- تحديث السجلات الموجودة
- حذف السجلات

النظام الآن متكامل بالكامل! 🎉

