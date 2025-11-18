import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart3, Users, ClipboardList } from 'lucide-react';

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, classesRes, attendanceRes] = await Promise.all([
        api.get('/users'),
        api.get('/classes'),
        api.get('/attendance'),
      ]);

      const users = usersRes.data;
      const attendance = attendanceRes.data;
      const present = attendance.filter((a: any) => a.status === 'present').length;
      const attendanceRate =
        attendance.length > 0 ? (present / attendance.length) * 100 : 0;

      setStats({
        totalStudents: users.filter((u: any) => u.role === 'student').length,
        totalTeachers: users.filter((u: any) => u.role === 'teacher').length,
        totalClasses: classesRes.data.length,
        attendanceRate: Math.round(attendanceRate),
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white animate-slide-up">التقارير</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الطلاب</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المعلمين</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalTeachers}
              </p>
            </div>
          </div>
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <ClipboardList className="h-8 w-8 text-purple-500" />
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الصفوف</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.totalClasses}
              </p>
            </div>
          </div>
        </div>
        <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <div className="mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">نسبة الحضور</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.attendanceRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;

