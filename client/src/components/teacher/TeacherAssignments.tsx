import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, X, Trash2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const TeacherAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    dueDate: '',
    attachments: [] as File[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, subjectsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/subjects'),
      ]);
      setAssignments(assignmentsRes.data);
      
      // Get teacher's subjects
      const teacherRes = await api.get('/teachers');
      const teacher = teacherRes.data.find((t: any) => t.userId === user?.id);
      if (teacher) {
        const teacherSubjects = subjectsRes.data.filter((s: any) => 
          teacher.subjectIds?.includes(s.id)
        );
        setSubjects(teacherSubjects);
      }
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

    if (!formData.subjectId || !formData.title || !formData.dueDate) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subjectId', formData.subjectId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('dueDate', formData.dueDate);
      
      formData.attachments.forEach((file) => {
        formDataToSend.append('attachments', file);
      });

      await api.post('/assignments', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('تم إنشاء الواجب بنجاح!');
      setShowModal(false);
      setFormData({
        subjectId: '',
        title: '',
        description: '',
        dueDate: '',
        attachments: [],
      });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إنشاء الواجب');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الواجب؟')) return;
    try {
      await api.delete(`/assignments/${id}`);
      setSuccess('تم حذف الواجب بنجاح!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف الواجب');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        attachments: Array.from(e.target.files),
      });
    }
  };

  if (loading) return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">الواجبات</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إنشاء واجب
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
        {assignments.length > 0 ? (
          assignments.map((assignment, index) => {
            const subject = subjects.find((s: any) => s.id === assignment.subjectId);
            return (
              <div
                key={assignment.id}
                className="card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h3>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {subject && (
                      <p className="text-sm text-primary-600 dark:text-primary-400 mb-2">
                        {subject.name}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{assignment.description}</p>
                    <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>تاريخ الاستحقاق: {format(new Date(assignment.dueDate), 'yyyy-MM-dd')}</span>
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 ml-1" />
                          {assignment.attachments.length} ملف
                        </span>
                      )}
                    </div>
                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {assignment.attachments.map((file: string, idx: number) => (
                          <a
                            key={idx}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Download className="h-3 w-3 ml-1" />
                            ملف {idx + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
            لا توجد واجبات
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">إنشاء واجب جديد</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setFormData({
                    subjectId: '',
                    title: '',
                    description: '',
                    dueDate: '',
                    attachments: [],
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">المادة</label>
                <select
                  className="input"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">اختر مادة</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
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
                <label className="label">الوصف</label>
                <textarea
                  className="input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">تاريخ الاستحقاق</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">المرفقات (اختياري)</label>
                <input
                  type="file"
                  className="input"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {formData.attachments.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    تم اختيار {formData.attachments.length} ملف
                  </p>
                )}
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
                      subjectId: '',
                      title: '',
                      description: '',
                      dueDate: '',
                      attachments: [],
                    });
                  }}
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

export default TeacherAssignments;
