import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Menu,
  X,
  Home,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  GraduationCap,
  ClipboardList,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

const Layout = ({ children, role }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    const base = [
      { name: 'لوحة التحكم', icon: Home, path: `/${role}` },
    ];

    if (role === 'admin') {
      return [
        ...base,
        { name: 'المستخدمون', icon: Users, path: `/${role}/users` },
        { name: 'الصفوف', icon: GraduationCap, path: `/${role}/classes` },
        { name: 'المواد', icon: BookOpen, path: `/${role}/subjects` },
        { name: 'الجدول الدراسي', icon: Calendar, path: `/${role}/timetable` },
        { name: 'الإعلانات', icon: Bell, path: `/${role}/announcements` },
        { name: 'التقارير', icon: BarChart3, path: `/${role}/reports` },
        { name: 'الرسائل', icon: MessageSquare, path: `/${role}/messages` },
      ];
    } else if (role === 'teacher') {
      return [
        ...base,
        { name: 'جدولي', icon: Calendar, path: `/${role}/schedule` },
        { name: 'الحضور والغياب', icon: ClipboardList, path: `/${role}/attendance` },
        { name: 'الدرجات', icon: BarChart3, path: `/${role}/grades` },
        { name: 'الواجبات', icon: FileText, path: `/${role}/assignments` },
        { name: 'الإعلانات', icon: Bell, path: `/${role}/announcements` },
        { name: 'الرسائل', icon: MessageSquare, path: `/${role}/messages` },
      ];
    } else if (role === 'student') {
      return [
        ...base,
        { name: 'الدرجات', icon: BarChart3, path: `/${role}/grades` },
        { name: 'الحضور', icon: ClipboardList, path: `/${role}/attendance` },
        { name: 'الواجبات', icon: FileText, path: `/${role}/assignments` },
        { name: 'الجدول الدراسي', icon: Calendar, path: `/${role}/timetable` },
        { name: 'الإعلانات', icon: Bell, path: `/${role}/announcements` },
        { name: 'الرسائل', icon: MessageSquare, path: `/${role}/messages` },
      ];
    } else {
      return [
        ...base,
        { name: 'أبنائي', icon: Users, path: `/${role}/children` },
        { name: 'الحضور', icon: ClipboardList, path: `/${role}/attendance` },
        { name: 'الدرجات', icon: BarChart3, path: `/${role}/grades` },
        { name: 'الواجبات', icon: FileText, path: `/${role}/assignments` },
        { name: 'الإعلانات', icon: Bell, path: `/${role}/announcements` },
        { name: 'الرسائل', icon: MessageSquare, path: `/${role}/messages` },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <SidebarContent
            navItems={navItems}
            user={user}
            logout={logout}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            location={location}
            navigate={navigate}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <SidebarContent
            navItems={navItems}
            user={user}
            logout={logout}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            location={location}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pr-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-4 border-l border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {navItems.find(item => location.pathname.startsWith(item.path))?.name || 'لوحة التحكم'}
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? 'مدير' : 
                     user?.role === 'teacher' ? 'معلم' : 
                     user?.role === 'student' ? 'طالب' : 
                     user?.role === 'parent' ? 'ولي أمر' : user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navItems: Array<{ name: string; icon: any; path: string }>;
  user: any;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  location: any;
  navigate: any;
  onNavigate?: () => void;
}

const SidebarContent = ({
  navItems,
  user,
  logout,
  darkMode,
  toggleDarkMode,
  location,
  navigate,
  onNavigate,
}: SidebarContentProps) => {
  return (
    <>
      <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <GraduationCap className="h-8 w-8 text-primary-600" />
        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">نظام إدارة المدرسة</span>
      </div>
      <div className="flex-grow flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  onNavigate?.();
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="ml-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={logout}
          className="flex-shrink-0 w-full group block"
        >
          <div className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <LogOut className="ml-3 h-5 w-5" />
            تسجيل الخروج
          </div>
        </button>
      </div>
    </>
  );
};

export default Layout;

