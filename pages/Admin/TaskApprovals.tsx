import React, { useEffect, useState } from 'react';
import { getSubmissions, getTasks, approveSubmission, rejectSubmission, getUserName } from '../../services/mockBackend';
import { TaskSubmission, Task, SubmissionStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, ExternalLink, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Search } from 'lucide-react';

export const TaskApprovals: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [msg, setMsg] = useState<{ type: 'success'|'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const allSubmissions = getSubmissions();
    setSubmissions(allSubmissions.filter(s => s.status === SubmissionStatus.PENDING));
    setTasks(getTasks());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveSubmission(id);
      setMsg({ type: 'success', text: 'Submission Approved & Worker Credited!' });
      setTimeout(() => setMsg(null), 3000);
      loadData();
    } catch (e: any) {
      alert('Error approving: ' + e.message);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Reject this submission? Worker will not be paid.')) {
        try {
            await rejectSubmission(id);
            setMsg({ type: 'error', text: 'Submission Rejected.' });
            setTimeout(() => setMsg(null), 3000);
            loadData();
        } catch (e: any) {
            alert('Error rejecting: ' + e.message);
        }
    }
  };

  const getTaskTitle = (id: string) => tasks.find(t => t.id === id)?.title || 'Unknown Task';
  const getTaskReward = (id: string) => tasks.find(t => t.id === id)?.reward || 0;

  const filteredSubmissions = submissions.filter(sub => {
      const uName = getUserName(sub.userId).toLowerCase();
      const uId = sub.userId.toLowerCase();
      const tTitle = getTaskTitle(sub.taskId).toLowerCase();
      const term = searchTerm.toLowerCase();

      return uName.includes(term) || uId.includes(term) || tTitle.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Worker Task Submissions</h2>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text"
                placeholder="Search UID, User, Task..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-bold">{msg.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">User & UID</th>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Reward</th>
                <th className="px-6 py-3 font-medium">Proof</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No pending submissions found.</td></tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{getUserName(sub.userId)}</div>
                        <div className="font-mono text-xs text-gray-500">{sub.userId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                        {getTaskTitle(sub.taskId)}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                        ${getTaskReward(sub.taskId).toFixed(3)}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                            {sub.textProof && (
                                <div className="flex items-start gap-2 text-gray-600 text-xs bg-gray-100 p-2 rounded max-w-xs">
                                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                                    <span className="break-words line-clamp-2" title={sub.textProof}>{sub.textProof}</span>
                                </div>
                            )}
                            {sub.imageProofUrl && (
                                <a href={sub.imageProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs font-medium">
                                    <ImageIcon size={14} /> View Image <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button size="sm" onClick={() => handleApprove(sub.id)} className="bg-green-600 hover:bg-green-700" title="Approve & Pay">
                                <Check size={16} />
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(sub.id)} title="Reject">
                                <X size={16} />
                            </Button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};