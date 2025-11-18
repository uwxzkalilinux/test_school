import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Check, X, Clock } from 'lucide-react';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setAttendance(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 animate-pulse">جاري التحميل...</div>;

  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const total = attendance.length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'absent':
        return 'غائب';
      case 'late':
        return 'متأخر';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">الحضور والغياب</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center animate-slide-up" style={{ animationDelay: '0s' }}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">نسبة الحضور</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{rate}%</p>
        </div>
        <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">حاضر</p>
          <p className="text-3xl font-bold text-green-600">{present}</p>
        </div>
        <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">غائب</p>
          <p className="text-3xl font-bold text-red-600">{absent}</p>
        </div>
        <div className="card text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">متأخر</p>
          <p className="text-3xl font-bold text-yellow-600">{late}</p>
        </div>
      </div>

      <div className="card animate-slide-up">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">سجل الحضور</h2>
        <div className="space-y-2">
          {attendance.length > 0 ? (
            attendance.map((record, index) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('ar-SA')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getStatusText(record.status)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              لا توجد سجلات حضور
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;

