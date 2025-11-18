import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Plus, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TeacherGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    examType: 'quiz',
    score: '',
    maxScore: '100',
    comments: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, studentsRes, subjectsRes] = await Promise.all([
        api.get('/grades'),
        api.get('/students'),
        api.get('/subjects'),
      ]);
      setGrades(gradesRes.data);
      setStudents(studentsRes.data);
      
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

    if (!formData.studentId || !formData.subjectId || !formData.score) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      await api.post('/grades', {
        ...formData,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore) || 100,
      });
      setSuccess('تم إضافة الدرجة بنجاح!');
      setShowModal(false);
      setFormData({
        studentId: '',
        subjectId: '',
        examType: 'quiz',
        score: '',
        maxScore: '100',
        comments: '',
      });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل إضافة الدرجة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدرجة؟')) return;
    try {
      await api.delete(`/grades/${id}`);
      setSuccess('تم حذف الدرجة بنجاح!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل حذف الدرجة');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getExamTypeText = (type: string) => {
    const types: Record<string, string> = {
      quiz: 'اختبار قصير',
      midterm: 'امتحان نصفي',
      final: 'امتحان نهائي',
      assignment: 'واجب',
      project: 'مشروع',
    };
    return types[type] || type;
  };

  if (loading) return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">الدرجات</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="h-4 w-4 ml-2" />
          إضافة درجة
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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الطالب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  المادة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الدرجة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {grades.length > 0 ? (
                grades.map((grade) => {
                  const student = students.find((s: any) => s.id === grade.studentId);
                  const subject = subjects.find((s: any) => s.id === grade.subjectId);
                  return (
                    <tr key={grade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student?.name || grade.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {subject?.name || grade.subjectId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getExamTypeText(grade.examType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {grade.score} / {grade.maxScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(grade.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    لا توجد درجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">إضافة درجة جديدة</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setFormData({
                    studentId: '',
                    subjectId: '',
                    examType: 'quiz',
                    score: '',
                    maxScore: '100',
                    comments: '',
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
                  <label className="label">الطالب</label>
                  <select
                    className="input"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    required
                  >
                    <option value="">اختر طالب</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
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
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">نوع الامتحان</label>
                  <select
                    className="input"
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    required
                  >
                    <option value="quiz">اختبار قصير</option>
                    <option value="midterm">امتحان نصفي</option>
                    <option value="final">امتحان نهائي</option>
                    <option value="assignment">واجب</option>
                    <option value="project">مشروع</option>
                  </select>
                </div>
                <div>
                  <label className="label">الدرجة</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    required
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">الدرجة الكاملة</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    required
                    min="1"
                    step="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">ملاحظات (اختياري)</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
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
                      studentId: '',
                      subjectId: '',
                      examType: 'quiz',
                      score: '',
                      maxScore: '100',
                      comments: '',
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

export default TeacherGrades;
