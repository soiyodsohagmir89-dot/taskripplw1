
import React, { useEffect, useState } from 'react';
import { getAllOfficialAccountSubmissions, approveOfficialAccountSubmission, rejectOfficialAccountSubmission, getUserName } from '../../services/mockBackend';
import { OfficialAccountSubmission, SubmissionStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, RefreshCw, Search, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

export const OfficialWorkerJobs: React.FC = () => {
  const [jobs, setJobs] = useState<OfficialAccountSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fadingRows, setFadingRows] = useState<Set<string>>(new Set());
  const [selectedJob, setSelectedJob] = useState<OfficialAccountSubmission | null>(null);

  const loadData = () => {
    const allJobs = getAllOfficialAccountSubmissions();
    const sorted = allJobs.sort((a, b) => {
      if (a.status === SubmissionStatus.PENDING && b.status !== SubmissionStatus.PENDING) return -1;
      if (a.status !== SubmissionStatus.PENDING && b.status === SubmissionStatus.PENDING) return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
    setJobs(sorted);
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: SubmissionStatus.APPROVED } : j));
    await approveOfficialAccountSubmission(id); 
    if(selectedJob?.id === id) setSelectedJob(prev => prev ? {...prev, status: SubmissionStatus.APPROVED} : null);
  };

  const handleReject = async (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: SubmissionStatus.REJECTED } : j));
    await rejectOfficialAccountSubmission(id);
    if(selectedJob?.id === id) setSelectedJob(prev => prev ? {...prev, status: SubmissionStatus.REJECTED} : null);
  };

  const filteredJobs = jobs.filter(job => {
      const uName = getUserName(job.userId).toLowerCase();
      const term = searchTerm.toLowerCase();
      // Search in dynamic data values too
      // FIX: Added a type check to ensure `v` is a string before calling `toLowerCase`.
      const dataMatch = job.data ? Object.values(job.data).some(v => typeof v === 'string' && v.toLowerCase().includes(term)) : false;
      return uName.includes(term) || job.jobTitle.toLowerCase().includes(term) || dataMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">HPJ Submissions</h2>
        <div className="flex gap-2 w-full md:w-auto">
            <input className="w-full pl-4 pr-4 py-2 border rounded-lg" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Button variant="secondary" onClick={loadData}><RefreshCw size={18}/></Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reward</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold">{getUserName(job.userId)}</td>
                    <td className="px-6 py-4">{job.jobTitle}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${job.status === 'APPROVED' ? 'bg-green-100 text-green-700' : job.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{job.status}</span></td>
                    <td className="px-6 py-4 font-bold text-green-600">${job.reward.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedJob(job)}><Eye size={16}/></Button>
                        <Button size="sm" onClick={() => handleApprove(job.id)} disabled={job.status !== 'PENDING'} className="bg-green-600"><Check size={16}/></Button>
                        <Button size="sm" variant="danger" onClick={() => handleReject(job.id)} disabled={job.status !== 'PENDING'}><X size={16}/></Button>
                    </td>
                  </tr>
              ))}
            </tbody>
        </table>
      </div>

      {selectedJob && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-xl font-bold">{selectedJob.jobTitle}</h3>
                      <button onClick={() => setSelectedJob(null)}><XCircle className="text-gray-400"/></button>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1">
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-500 mb-4">
                          User: <strong>{getUserName(selectedJob.userId)}</strong><br/>
                          ID: {selectedJob.userId}<br/>
                          Date: {new Date(selectedJob.submittedAt).toLocaleString()}
                      </div>
                      
                      {/* Render Dynamic Data */}
                      {selectedJob.data ? Object.entries(selectedJob.data).map(([key, val]) => (
                          <div key={key}>
                              <p className="text-xs text-gray-500 uppercase font-bold">{key}</p>
                              <p className="p-2 border rounded bg-white text-sm break-all">{val}</p>
                          </div>
                      )) : (
                          // Fallback for legacy
                          <>
                             <p className="text-xs text-gray-500 uppercase font-bold">Facebook Name</p><p className="p-2 border rounded bg-white">{selectedJob.fbName}</p>
                             <p className="text-xs text-gray-500 uppercase font-bold">Phone</p><p className="p-2 border rounded bg-white">{selectedJob.phone}</p>
                          </>
                      )}
                  </div>
                  {selectedJob.status === 'PENDING' && (
                      <div className="pt-4 border-t mt-4 flex gap-2">
                          <Button className="flex-1 bg-green-600" onClick={() => { handleApprove(selectedJob.id); setSelectedJob(null); }}>Approve</Button>
                          <Button className="flex-1 bg-red-600" onClick={() => { handleReject(selectedJob.id); setSelectedJob(null); }}>Reject</Button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
