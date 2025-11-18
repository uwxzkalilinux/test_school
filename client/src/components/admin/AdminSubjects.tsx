import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Trash2 } from 'lucide-react';

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', teacherId: '', classIds: [] as string[], code: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
        api.get('/teachers'),
      ]);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data || []);
      setClasses(classesRes.data);
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
    try {
      await api.post('/subjects', formData);
      setSuccess('تم إنشاء المادة بنجاح!');
      setShowModal(false);
      setFormData({ name: '', teacherId: '', classIds: [], code: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إنشاء المادة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المادة؟ سيتم حذف جميع الدرجات والحضور والواجبات المرتبطة.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/subjects/${id}`);
      setSuccess('تم حذف المادة بنجاح!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف المادة');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">المواد الدراسية</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مادة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const teacher = teachers.find((t: any) => t.id === subject.teacherId);
          const subjectClasses = classes.filter((c: any) => subject.classIds?.includes(c.id));
          return (
            <div key={subject.id} className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {subject.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الرمز: {subject.code}
              </p>
              {teacher && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  المعلم: {teacher.name}
                </p>
              )}
              {subjectClasses.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  الصفوف: {subjectClasses.map((c: any) => c.name).join('، ')}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">إضافة مادة جديدة</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">اسم المادة</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">الرمز</label>
                <input
                  type="text"
                  className="input"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">المعلم</label>
                <select
                  className="input"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">اختر معلم</option>
                  {teachers.map((teacher: any) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">الصفوف</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  {classes.map((classItem: any) => (
                    <label key={classItem.id} className="flex items-center space-x-2 space-x-reverse cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(classItem.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, classIds: [...formData.classIds, classItem.id] });
                          } else {
                            setFormData({ ...formData, classIds: formData.classIds.filter(id => id !== classItem.id) });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{classItem.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;

