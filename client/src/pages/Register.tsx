import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'admin' | 'teacher' | 'student' | 'parent',
    classId: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        classId: formData.classId || undefined,
        studentId: formData.studentId || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="card">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-primary-600 p-3 rounded-full">
                <School className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              إنشاء حساب جديد
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              انضم إلى نظام إدارة المدرسة
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="role" className="label">
                  الدور
                </label>
                <select
                  id="role"
                  name="role"
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="student">طالب</option>
                  <option value="teacher">معلم</option>
                  <option value="parent">ولي أمر</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <div>
                  <label htmlFor="studentId" className="label">
                    رقم الطالب (اختياري)
                  </label>
                  <input
                    id="studentId"
                    name="studentId"
                    type="text"
                    className="input"
                    placeholder="أدخل رقم الطالب"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  />
                </div>
              )}
              <div>
                <label htmlFor="password" className="label">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="input"
                  placeholder="أكد كلمة المرور"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex justify-center items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'تسجيل'
                )}
              </button>
            </div>

            <div className="text-center">
              <a
                href="/login"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="h-4 w-4 ml-1" />
                العودة لتسجيل الدخول
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

