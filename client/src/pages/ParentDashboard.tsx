import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Routes, Route } from 'react-router-dom';
import api from '../utils/api';
import { Users, ClipboardList, BarChart3, FileText, Bell } from 'lucide-react';
import ParentChildren from '../components/parent/ParentChildren';
import ParentAttendance from '../components/parent/ParentAttendance';
import ParentGrades from '../components/parent/ParentGrades';
import ParentAssignments from '../components/parent/ParentAssignments';
import ParentAnnouncements from '../components/parent/ParentAnnouncements';
import ParentMessages from '../components/parent/ParentMessages';

const ParentDashboard = () => {
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;
        // In a real app, you'd fetch children based on parent relationship
        // For now, we'll show a placeholder
        setChildren([]);
      } catch (error) {
        console.error('Failed to fetch children:', error);
      }
    };

    fetchChildren();
  }, []);

  return (
    <Layout role="parent">
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-up">لوحة تحكم ولي الأمر</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  راقب التقدم الأكاديمي لأبنائك
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuickLinkCard
                  icon={Users}
                  title="أبنائي"
                  description="عرض معلومات عن أبنائك"
                  href="/parent/children"
                />
                <QuickLinkCard
                  icon={ClipboardList}
                  title="الحضور"
                  description="تتبع سجلات الحضور"
                  href="/parent/attendance"
                />
                <QuickLinkCard
                  icon={BarChart3}
                  title="الدرجات"
                  description="عرض الأداء الأكاديمي"
                  href="/parent/grades"
                />
                <QuickLinkCard
                  icon={FileText}
                  title="الواجبات"
                  description="تحقق من الواجبات والأنشطة"
                  href="/parent/assignments"
                />
                <QuickLinkCard
                  icon={Bell}
                  title="الإعلانات"
                  description="ابق على اطلاع بآخر الأخبار"
                  href="/parent/announcements"
                />
              </div>
            </div>
          }
        />
        <Route path="/children" element={<ParentChildren />} />
        <Route path="/attendance" element={<ParentAttendance />} />
        <Route path="/grades" element={<ParentGrades />} />
        <Route path="/assignments" element={<ParentAssignments />} />
        <Route path="/announcements" element={<ParentAnnouncements />} />
        <Route path="/messages" element={<ParentMessages />} />
      </Routes>
    </Layout>
  );
};

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

export default ParentDashboard;

