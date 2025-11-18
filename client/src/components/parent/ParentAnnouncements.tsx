import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { format } from 'date-fns';

const ParentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h2>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {announcement.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{announcement.body}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {format(new Date(announcement.createdAt), 'PPp')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentAnnouncements;

