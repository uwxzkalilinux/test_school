import { useEffect, useState } from 'react';
import api from '../../utils/api';

const ParentAttendance = () => {
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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Children's Attendance</h2>
      <div className="card">
        <p className="text-gray-600 dark:text-gray-400">
          Attendance records for your children will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default ParentAttendance;

