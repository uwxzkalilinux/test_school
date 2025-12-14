import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { School } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Check if API URL is configured
  useEffect(() => {
    const apiError = localStorage.getItem('api_config_error');
    if (apiError === 'true') {
      setError('⚠️ API URL غير مضبوط! يرجى إضافة VITE_API_URL في Vercel Environment Variables.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      // Get user role and navigate to appropriate dashboard
      const userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
      if (userRole === 'admin') {
        navigate('/admin/');
      } else if (userRole === 'teacher') {
        navigate('/teacher/');
      } else if (userRole === 'student') {
        navigate('/student/');
      } else if (userRole === 'parent') {
        navigate('/parent/');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('لا يمكن الاتصال بالخادم. يرجى التحقق من إعدادات API URL.');
      } else if (err.response?.status === 404) {
        setError('الخادم غير متاح. يرجى التحقق من إعدادات VITE_API_URL في Vercel.');
      } else {
        setError(err.response?.data?.error || 'فشل تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="card">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-primary-600 p-3 rounded-full">
                <School className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              نظام إدارة المدرسة
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              سجل الدخول إلى حسابك
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
                <label htmlFor="email" className="label">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="label">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="input"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  'تسجيل الدخول'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ليس لديك حساب؟{' '}
                <a
                  href="/register"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  سجل هنا
                </a>
              </p>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>حساب تجريبي:</strong> admin@school.com / admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

