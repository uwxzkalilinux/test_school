import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Check, X, Clock } from 'lucide-react';

const TeacherAttendance = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleClassSelect = async (classId: string) => {
    setSelectedClass(classId);
    setStudents([]);
    setAttendance({});
    // Fetch students for this class
    try {
      const [classRes, studentsRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get('/students'),
      ]);
      const classData = classRes.data;
      const allStudents = studentsRes.data;
      // Filter students by class
      const classStudents = allStudents.filter((s: any) => 
        classData.studentIds?.includes(s.id)
      );
      setStudents(classStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      setError('يرجى اختيار المادة');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    if (students.length === 0) {
      setError('لا يوجد طلاب في هذا الصف');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Mark all students as present by default if not marked
    const records = students.map((student) => ({
      studentId: student.id,
      status: attendance[student.id] || 'present',
    }));

    try {
      await api.post('/attendance/bulk', {
        records,
        subjectId,
        classId: selectedClass,
        date,
      });
      setSuccess('تم تسجيل الحضور بنجاح!');
      setAttendance({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'فشل تسجيل الحضور');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تسجيل الحضور والغياب</h2>
      
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
      
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">اختر الصف</label>
            <select
              className="input"
              value={selectedClass}
              onChange={(e) => handleClassSelect(e.target.value)}
            >
              <option value="">اختر صف</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <>
              <div>
                <label className="label">اختر المادة</label>
                <select
                  className="input"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">اختر مادة</option>
                  {subjects
                    .filter((s: any) => s.classIds?.includes(selectedClass))
                    .map((subject: any) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="label">التاريخ</label>
                <input
                  type="date"
                  className="input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {selectedClass && subjectId && students.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              قائمة الطلاب ({students.length})
            </h3>
            {students.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{student.name}</span>
                </div>
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => handleStatusChange(student.id, 'present')}
                    className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                      attendance[student.id] === 'present'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-green-100 dark:hover:bg-green-900'
                    }`}
                    title="حاضر"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'absent')}
                    className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                      attendance[student.id] === 'absent'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-red-100 dark:hover:bg-red-900'
                    }`}
                    title="غائب"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.id, 'late')}
                    className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                      attendance[student.id] === 'late'
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-yellow-100 dark:hover:bg-yellow-900'
                    }`}
                    title="متأخر"
                  >
                    <Clock className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className="btn btn-primary w-full mt-6 text-lg py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </span>
              ) : (
                'حفظ الحضور'
              )}
            </button>
          </div>
        )}
        
        {selectedClass && students.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            لا يوجد طلاب في هذا الصف
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;

