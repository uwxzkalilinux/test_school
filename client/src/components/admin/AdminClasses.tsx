import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, Edit } from 'lucide-react';

const AdminClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ name: '', level: '' });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const [classesRes, studentsRes, teachersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/students'),
        api.get('/teachers'),
      ]);
      setClasses(classesRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/classes', formData);
      setSuccess('تم إنشاء الصف بنجاح!');
      setShowModal(false);
      setFormData({ name: '', level: '' });
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إنشاء الصف');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصف؟ سيتم إزالته من جميع المواد والجداول.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/classes/${id}`);
      setSuccess('تم حذف الصف بنجاح!');
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف الصف');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">الصفوف</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة صف
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
        {classes.map((classItem) => {
          const classStudents = students.filter((s: any) => classItem.studentIds?.includes(s.id));
          const classTeachers = teachers.filter((t: any) => classItem.teacherIds?.includes(t.id));
          return (
            <div key={classItem.id} className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {classItem.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                المستوى: {classItem.level}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                الطلاب: {classStudents.length}
              </p>
              {classStudents.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  {classStudents.slice(0, 3).map((s: any) => s.name).join('، ')}
                  {classStudents.length > 3 && '...'}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                المعلمون: {classTeachers.length}
              </p>
              {classTeachers.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                  {classTeachers.slice(0, 2).map((t: any) => t.name).join('، ')}
                  {classTeachers.length > 2 && '...'}
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
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
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">إضافة صف جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">اسم الصف</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">المستوى</label>
                <input
                  type="text"
                  className="input"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  required
                />
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

export default AdminClasses;

