import { useEffect, useState } from 'react';
import api from '../../utils/api';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get('/timetable');
      setTimetable(res.data);
    } catch (error) {
      console.error('Failed to fetch timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const groupedByDay = days.map(day => ({
    day,
    items: timetable.filter(t => t.day === day),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Timetable</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {groupedByDay.map(({ day, items }) => (
          <div key={day} className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 capitalize">
              {day}
            </h3>
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                    <p className="font-medium">{item.startTime} - {item.endTime}</p>
                    {item.room && <p className="text-xs text-gray-600 dark:text-gray-400">Room: {item.room}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No classes</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;

