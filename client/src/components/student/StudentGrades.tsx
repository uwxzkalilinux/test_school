import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart3 } from 'lucide-react';

const StudentGrades = () => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await api.get('/grades');
      setGrades(res.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const averageGrade =
    grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-primary-600" />
          <div className="ml-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Grade</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {Math.round(averageGrade)}%
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">All Grades</h2>
        <div className="space-y-3">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {grade.examType}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(grade.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {grade.score} / {grade.maxScore}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((grade.score / grade.maxScore) * 100)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;

