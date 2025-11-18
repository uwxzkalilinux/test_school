import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', body: '', targetGroup: 'all' as any });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/announcements', formData);
      setSuccess('تم نشر الإعلان بنجاح!');
      setShowModal(false);
      setFormData({ title: '', body: '', targetGroup: 'all' });
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل نشر الإعلان');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/announcements/${id}`);
      setSuccess('تم حذف الإعلان بنجاح!');
      fetchAnnouncements();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف الإعلان');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">الإعلانات</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إعلان جديد
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

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {announcement.title}
              </h3>
              <button
                onClick={() => handleDelete(announcement.id)}
                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{announcement.body}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {format(new Date(announcement.createdAt), 'PPp')}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              إعلان جديد
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">العنوان</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">المحتوى</label>
                <textarea
                  className="input"
                  rows={5}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">الفئة المستهدفة</label>
                <select
                  className="input"
                  value={formData.targetGroup}
                  onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                >
                  <option value="all">جميع المستخدمين</option>
                  <option value="role">حسب الدور</option>
                  <option value="class">حسب الصف</option>
                </select>
              </div>
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setFormData({ title: '', body: '', targetGroup: 'all' });
                  }}
                  className="btn btn-secondary"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary">
                  نشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;

