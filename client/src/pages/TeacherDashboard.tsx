import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Routes, Route } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, ClipboardList, FileText, Users } from 'lucide-react';
import TeacherSchedule from '../components/teacher/TeacherSchedule';
import TeacherAttendance from '../components/teacher/TeacherAttendance';
import TeacherGrades from '../components/teacher/TeacherGrades';
import TeacherAssignments from '../components/teacher/TeacherAssignments';
import TeacherAnnouncements from '../components/teacher/TeacherAnnouncements';
import TeacherMessages from '../components/teacher/TeacherMessages';

const TeacherDashboard = () => {
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      try {
        const res = await api.get('/timetable');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = days[new Date().getDay()];
        const schedule = res.data.filter((item: any) => item.day === today);
        setTodaySchedule(schedule);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      }
    };

    fetchTodaySchedule();
  }, []);

  return (
    <Layout role="teacher">
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white animate-slide-up">لوحة تحكم المعلم</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  مرحباً بعودتك! إليك نظرة عامة على يومك.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="card animate-slide-up">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                      <Calendar className="h-5 w-5 ml-2" />
                      جدول اليوم
                    </h2>
                    {todaySchedule.length > 0 ? (
                      <div className="space-y-3">
                        {todaySchedule.map((item, index) => (
                          <div
                            key={item.id}
                            className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg hover:shadow-md transition-all duration-200 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.startTime} - {item.endTime}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.room && `القاعة: ${item.room}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">لا توجد حصص مجدولة لهذا اليوم</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <QuickActionCard
                    icon={ClipboardList}
                    title="تسجيل الحضور"
                    description="سجل حضور طلابك"
                    href="/teacher/attendance"
                  />
                  <QuickActionCard
                    icon={FileText}
                    title="الواجبات"
                    description="أنشئ وقيم الواجبات"
                    href="/teacher/assignments"
                  />
                  <QuickActionCard
                    icon={Users}
                    title="الدرجات"
                    description="أضف وأدرج درجات الطلاب"
                    href="/teacher/grades"
                  />
                </div>
              </div>
            </div>
          }
        />
        <Route path="/schedule" element={<TeacherSchedule />} />
        <Route path="/attendance" element={<TeacherAttendance />} />
        <Route path="/grades" element={<TeacherGrades />} />
        <Route path="/assignments" element={<TeacherAssignments />} />
        <Route path="/announcements" element={<TeacherAnnouncements />} />
        <Route path="/messages" element={<TeacherMessages />} />
      </Routes>
    </Layout>
  );
};

const QuickActionCard = ({ icon: Icon, title, description, href }: any) => (
  <a
    href={href}
    className="block card hover:shadow-lg transition-all duration-200 transform hover:scale-105 animate-slide-up"
  >
    <Icon className="h-8 w-8 text-primary-600 mb-3" />
    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </a>
);

export default TeacherDashboard;

