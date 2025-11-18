import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Routes, Route } from 'react-router-dom';
import api from '../utils/api';
import { BarChart3, ClipboardList, FileText, Calendar, Bell } from 'lucide-react';
import StudentGrades from '../components/student/StudentGrades';
import StudentAttendance from '../components/student/StudentAttendance';
import StudentAssignments from '../components/student/StudentAssignments';
import StudentTimetable from '../components/student/StudentTimetable';
import StudentAnnouncements from '../components/student/StudentAnnouncements';
import StudentMessages from '../components/student/StudentMessages';

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    pendingAssignments: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [assignmentsRes, gradesRes, attendanceRes] = await Promise.all([
          api.get('/assignments'),
          api.get('/grades'),
          api.get('/attendance'),
        ]);

        const assignments = assignmentsRes.data;
        const now = new Date();
        const pending = assignments.filter((a: any) => new Date(a.dueDate) > now).length;

        const grades = gradesRes.data;
        const avgGrade =
          grades.length > 0
            ? grades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) /
              grades.length
            : 0;

        const attendance = attendanceRes.data;
        const present = attendance.filter((a: any) => a.status === 'present').length;
        const attendanceRate = attendance.length > 0 ? (present / attendance.length) * 100 : 0;

        setStats({
          pendingAssignments: pending,
          averageGrade: Math.round(avgGrade),
          attendanceRate: Math.round(attendanceRate),
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout role="student">
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-up">لوحة تحكم الطالب</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  مرحباً! إليك نظرة عامة على أدائك الأكاديمي.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="الواجبات المعلقة"
                  value={stats.pendingAssignments}
                  icon={FileText}
                  color="bg-orange-500"
                  delay="0s"
                />
                <StatCard
                  title="المعدل"
                  value={`${stats.averageGrade}%`}
                  icon={BarChart3}
                  color="bg-green-500"
                  delay="0.1s"
                />
                <StatCard
                  title="نسبة الحضور"
                  value={`${stats.attendanceRate}%`}
                  icon={ClipboardList}
                  color="bg-blue-500"
                  delay="0.2s"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickLinkCard
                  icon={FileText}
                  title="الواجبات"
                  description="عرض وتقديم واجباتك"
                  href="/student/assignments"
                />
                <QuickLinkCard
                  icon={BarChart3}
                  title="الدرجات"
                  description="تحقق من درجاتك وأدائك"
                  href="/student/grades"
                />
                <QuickLinkCard
                  icon={Calendar}
                  title="الجدول الدراسي"
                  description="عرض جدولك الدراسي"
                  href="/student/timetable"
                />
                <QuickLinkCard
                  icon={Bell}
                  title="الإعلانات"
                  description="ابق على اطلاع بآخر الأخبار"
                  href="/student/announcements"
                />
              </div>
            </div>
          }
        />
        <Route path="/grades" element={<StudentGrades />} />
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/assignments" element={<StudentAssignments />} />
        <Route path="/timetable" element={<StudentTimetable />} />
        <Route path="/announcements" element={<StudentAnnouncements />} />
        <Route path="/messages" element={<StudentMessages />} />
      </Routes>
    </Layout>
  );
};

const StatCard = ({ title, value, icon: Icon, color, delay = '0s' }: any) => (
  <div className="card animate-slide-up" style={{ animationDelay: delay }}>
    <div className="flex items-center">
      <div className={`${color} p-4 rounded-xl shadow-lg transform hover:scale-110 transition-transform duration-200`}>
        <Icon className="h-7 w-7 text-white" />
      </div>
      <div className="mr-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  </div>
);

const QuickLinkCard = ({ icon: Icon, title, description, href }: any) => (
  <a
    href={href}
    className="block card hover:shadow-lg transition-all duration-200 transform hover:scale-105 animate-slide-up"
  >
    <Icon className="h-8 w-8 text-primary-600 mb-3" />
    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </a>
);

export default StudentDashboard;

