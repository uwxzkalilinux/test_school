import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/assignments'),
      ]);
      setAssignments(assignmentsRes.data);
      // Fetch submissions for each assignment
      setSubmissions([]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchData();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const now = new Date();
  const pending = assignments.filter(a => new Date(a.dueDate) > now);
  const overdue = assignments.filter(a => new Date(a.dueDate) < now);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{pending.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-3xl font-bold text-red-600">{overdue.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const isOverdue = new Date(assignment.dueDate) < now;
          const isSubmitted = submissions.some(s => s.assignmentId === assignment.id);

          return (
            <div
              key={assignment.id}
              className={`card ${isOverdue && !isSubmitted ? 'border-red-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {assignment.title}
                </h3>
                {isSubmitted && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{assignment.description}</p>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                  Due: {format(new Date(assignment.dueDate), 'PPp')}
                </p>
                {!isSubmitted && (
                  <label className="btn btn-primary flex items-center cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Submit
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(assignment.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentAssignments;

