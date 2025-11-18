import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, X } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'teacher' | 'student' | 'parent',
    classId: '',
    studentId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const [usersRes, classesRes, studentsRes, teachersRes] = await Promise.all([
        api.get('/users'),
        api.get('/classes'),
        api.get('/students'),
        api.get('/teachers'),
      ]);
      setUsers(usersRes.data);
      setClasses(classesRes.data);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/users', formData);
      setSuccess('تم إنشاء المستخدم بنجاح!');
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        classId: '',
        studentId: '',
      });
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إنشاء المستخدم');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع البيانات المرتبطة به.')) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccess('تم حذف المستخدم بنجاح!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'فشل حذف المستخدم');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">المستخدمون</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة مستخدم
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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => {
                let additionalInfo = '';
                if (user.role === 'student') {
                  const student = students.find((s: any) => s.userId === user.id);
                  if (student) {
                    const classItem = classes.find((c: any) => c.id === student.classId);
                    additionalInfo = classItem ? ` - ${classItem.name}` : '';
                  }
                } else if (user.role === 'teacher') {
                  const teacher = teachers.find((t: any) => t.userId === user.id);
                  if (teacher) {
                    additionalInfo = ` - ${teacher.subjectIds?.length || 0} مادة`;
                  }
                }
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                      {additionalInfo && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">
                          {additionalInfo}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New User</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    classId: '',
                    studentId: '',
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">الاسم</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">كلمة المرور</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="اتركه فارغاً للاستخدام الافتراضي: password123"
                />
              </div>
              <div>
                <label className="label">الدور</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="student">طالب</option>
                  <option value="teacher">معلم</option>
                  <option value="parent">ولي أمر</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="label">الصف</label>
                    <select
                      className="input"
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
                    <label className="label">رقم الطالب (اختياري)</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="مثال: STU-001"
                    />
                  </div>
                </>
              )}
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      role: 'student',
                      classId: '',
                      studentId: '',
                    });
                  }}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  إنشاء مستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

