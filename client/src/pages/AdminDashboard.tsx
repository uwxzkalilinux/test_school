import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Routes, Route } from 'react-router-dom';
import api from '../utils/api';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import AdminUsers from '../components/admin/AdminUsers';
import AdminClasses from '../components/admin/AdminClasses';
import AdminSubjects from '../components/admin/AdminSubjects';
import AdminTimetable from '../components/admin/AdminTimetable';
import AdminAnnouncements from '../components/admin/AdminAnnouncements';
import AdminReports from '../components/admin/AdminReports';
import AdminMessages from '../components/admin/AdminMessages';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, classesRes, subjectsRes] = await Promise.all([
          api.get('/users'),
          api.get('/classes'),
          api.get('/subjects'),
        ]);

        const users = usersRes.data;
        setStats({
          students: users.filter((u: any) => u.role === 'student').length,
          teachers: users.filter((u: any) => u.role === 'teacher').length,
          classes: classesRes.data.length,
          subjects: subjectsRes.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Layout role="admin">
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-up">لوحة تحكم المدير</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  إدارة نظام المدرسة
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="الطلاب"
                  value={stats.students}
                  icon={Users}
                  color="bg-blue-500"
                  delay="0s"
                />
                <StatCard
                  title="المعلمون"
                  value={stats.teachers}
                  icon={GraduationCap}
                  color="bg-green-500"
                  delay="0.1s"
                />
                <StatCard
                  title="الصفوف"
                  value={stats.classes}
                  icon={BookOpen}
                  color="bg-purple-500"
                  delay="0.2s"
                />
                <StatCard
                  title="المواد"
                  value={stats.subjects}
                  icon={Calendar}
                  color="bg-orange-500"
                  delay="0.3s"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card animate-slide-up">
                  <h2 className="text-xl font-semibold mb-4">إجراءات سريعة</h2>
                  <div className="space-y-2">
                    <QuickActionButton label="إضافة مستخدم جديد" href="/admin/users" />
                    <QuickActionButton label="إنشاء صف" href="/admin/classes" />
                    <QuickActionButton label="إضافة مادة" href="/admin/subjects" />
                    <QuickActionButton label="نشر إعلان" href="/admin/announcements" />
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/classes" element={<AdminClasses />} />
        <Route path="/subjects" element={<AdminSubjects />} />
        <Route path="/timetable" element={<AdminTimetable />} />
        <Route path="/announcements" element={<AdminAnnouncements />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/messages" element={<AdminMessages />} />
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

const QuickActionButton = ({ label, href }: any) => (
  <a
    href={href}
    className="block w-full px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/20 dark:hover:to-primary-800/20 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
  >
    {label}
  </a>
);

export default AdminDashboard;

