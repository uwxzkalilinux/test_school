import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, X, Trash2 } from 'lucide-react';

const AdminTimetable = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    teacherId: '',
    day: 'monday',
    startTime: '',
    endTime: '',
    room: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [timetableRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      setTimetable(timetableRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.classId || !formData.subjectId || !formData.teacherId || !formData.startTime || !formData.endTime) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await api.post('/timetable', formData);
      setSuccess('تم إضافة الحصة بنجاح!');
      setShowModal(false);
      setFormData({
        classId: '',
        subjectId: '',
        teacherId: '',
        day: 'monday',
        startTime: '',
        endTime: '',
        room: '',
      });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إضافة الحصة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setSuccess('تم حذف الحصة بنجاح!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف الحصة');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  const days = [
    { value: 'monday', label: 'الإثنين' },
    { value: 'tuesday', label: 'الثلاثاء' },
    { value: 'wednesday', label: 'الأربعاء' },
    { value: 'thursday', label: 'الخميس' },
    { value: 'friday', label: 'الجمعة' },
  ];

  const groupedByDay = days.map(({ value, label }) => ({
    day: value,
    label,
    items: timetable.filter(t => t.day === value),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">الجدول الدراسي</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة حصة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg animate-slide-up">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg animate-slide-up">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {groupedByDay.map(({ day, label, items }) => (
          <div key={day} className="card animate-slide-up">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center text-lg border-b pb-2">
              {label}
            </h3>
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item, index) => {
                  const subject = subjects.find(s => s.id === item.subjectId);
                  const classItem = classes.find(c => c.id === item.classId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg hover:shadow-md transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-primary-700 dark:text-primary-300 text-sm">
                          {item.startTime} - {item.endTime}
                        </p>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {subject?.name || 'مادة غير معروفة'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {classItem?.name || 'صف غير معروف'}
                      </p>
                      {item.room && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          القاعة: {item.room}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">لا توجد حصص</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">إضافة حصة جديدة</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setFormData({
                    classId: '',
                    subjectId: '',
                    teacherId: '',
                    day: 'monday',
                    startTime: '',
                    endTime: '',
                    room: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">الصف</label>
                  <select
                    className="input"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">اختر صف</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">المادة</label>
                  <select
                    className="input"
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                  >
                    <option value="">اختر مادة</option>
                    {subjects
                      .filter(s => !formData.classId || s.classIds?.includes(formData.classId))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label">المعلم</label>
                  <select
                    className="input"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    required
                  >
                    <option value="">اختر معلم</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">اليوم</label>
                  <select
                    className="input"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                  >
                    {days.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">وقت البداية</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">وقت النهاية</label>
                  <input
                    type="time"
                    className="input"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">القاعة (اختياري)</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="مثال: 101"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({
                      classId: '',
                      subjectId: '',
                      teacherId: '',
                      day: 'monday',
                      startTime: '',
                      endTime: '',
                      room: '',
                    });
                  }}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimetable;
