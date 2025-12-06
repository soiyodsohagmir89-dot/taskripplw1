
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitOfficialWorkerRequest, submitOfficialAccountData, getOfficialAccountData, getUsers, getHighPayingJobs } from '../../services/mockBackend';
import { OfficialWorkerStatus, SubmissionStatus, OfficialAccountSubmission, HighPayingJob } from '../../types';
import { Button } from '../../components/ui/Button';
import { Lock, Briefcase, Clock, XCircle, CheckCircle, Zap, AlertCircle, Save, PlusCircle, History, ChevronRight } from 'lucide-react';

export const OfficialWorker: React.FC = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', phone: '', secretCode: '' });
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Job List State
  const [activeJobs, setActiveJobs] = useState<HighPayingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<HighPayingJob | null>(null);

  // Dynamic Form State
  const [dynamicForm, setDynamicForm] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // History
  const [mySubmissions, setMySubmissions] = useState<OfficialAccountSubmission[]>([]);

  useEffect(() => {
    // Poll user status
    if (!user || user.officialWorkerStatus !== OfficialWorkerStatus.PENDING) return;
    const intervalId = setInterval(() => {
      const allUsers = getUsers();
      const freshUser = allUsers.find(u => u.id === user.id);
      if (freshUser && freshUser.officialWorkerStatus !== OfficialWorkerStatus.PENDING) {
        setUser(freshUser);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [user, setUser]);

  useEffect(() => {
    if (user && user.officialWorkerStatus === OfficialWorkerStatus.APPROVED) {
       loadData();
       const interval = setInterval(loadData, 5000);
       return () => clearInterval(interval);
    }
  }, [user, submitSuccess]);

  const loadData = () => {
      // Load Active Jobs
      const jobs = getHighPayingJobs().filter(j => j.status === 'ACTIVE');
      setActiveJobs(jobs);
      
      // Load Submissions
      if(user) {
          const data = getOfficialAccountData(user.id);
          setMySubmissions(data);
      }
  };

  const refreshData = () => setRefreshKey(prev => prev + 1);

  if (!user) return null;

  // --- HANDLERS ---

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const updatedUser = submitOfficialWorkerRequest(user.id, formData.name, formData.phone, formData.secretCode);
      setUser(updatedUser);
      refreshData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDynamicChange = (label: string, value: string) => {
      setDynamicForm(prev => ({ ...prev, [label]: value }));
  };

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        submitOfficialAccountData(user.id, selectedJob.id, dynamicForm);
        setSubmitSuccess(true);
        setIsSubmitting(false);
        setDynamicForm({}); // Reset form
        loadData();
      } catch (err: any) {
        setError(err.message);
        setIsSubmitting(false);
      }
    }, 1500);
  };

  // --- VIEWS ---

  // 1. NOT APPROVED
  if (!user.officialWorkerStatus || user.officialWorkerStatus === OfficialWorkerStatus.NONE || user.officialWorkerStatus === OfficialWorkerStatus.REJECTED) {
    const isVerified = user.isVerified;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg"><Briefcase size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">High Paying Job Approval</h2>
              <p className="text-gray-500 text-sm">Enter secret code for instant access.</p>
            </div>
          </div>
          {!isVerified && <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800 text-sm">Account verification required.</div>}
          {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleApply} className={`space-y-4 ${!isVerified ? 'opacity-60 pointer-events-none' : ''}`}>
            <input required className="w-full px-4 py-2 border rounded-lg" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="tel" className="w-full px-4 py-2 border rounded-lg" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <input required className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg font-mono text-lg tracking-widest" placeholder="HPJ-XXXXXX" value={formData.secretCode} onChange={e => setFormData({...formData, secretCode: e.target.value})} />
            <Button type="submit" className="w-full py-4 text-lg font-bold flex justify-center gap-2" disabled={!isVerified}><Zap size={20} className="fill-white" /> Submit & Approve</Button>
          </form>
          <div className="mt-6 border-t pt-4 text-center">
             <a href="https://chat.whatsapp.com/HUP0upZCu2v9yh1Pz6DHew" target="_blank" className="text-green-600 font-bold hover:underline">Join WhatsApp Training for Code</a>
          </div>
        </div>
      </div>
    );
  }

  // 2. PENDING
  if (user.officialWorkerStatus === OfficialWorkerStatus.PENDING) {
    return <div className="text-center p-12 bg-white rounded-xl border"><h2 className="text-2xl font-bold">Pending Review</h2></div>;
  }

  // 3. APPROVED - JOB LIST & FORM
  const pendingCount = mySubmissions.filter(s => s.status === SubmissionStatus.PENDING).length;
  const approvedCount = mySubmissions.filter(s => s.status === SubmissionStatus.APPROVED).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
             <h3 className="font-bold flex items-center gap-2"><Briefcase size={20} /> High Paying Jobs</h3>
             <p className="text-sm opacity-80 mt-1">Verified Worker Access</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Pending</p><p className="text-3xl font-bold text-yellow-600">{pendingCount}</p></div>
          <div className="bg-white p-6 rounded-xl border shadow-sm"><p className="text-xs font-bold text-gray-500 uppercase">Approved</p><p className="text-3xl font-bold text-green-600">{approvedCount}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Job Selection & Form */}
        <div className="lg:col-span-2 space-y-6">
            {!selectedJob ? (
                // JOB LIST
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-900">Available Jobs ({activeJobs.length})</h3></div>
                    {activeJobs.length === 0 ? <div className="p-8 text-center text-gray-500">No active jobs found.</div> : (
                        <div className="divide-y">
                            {activeJobs.map(job => (
                                <div key={job.id} className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => setSelectedJob(job)}>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900">{job.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{job.fields.length} Fields • Paid per submission</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-green-600 text-lg">${job.reward.toFixed(2)}</span>
                                        <Button size="sm" className="mt-1">Start <ChevronRight size={14}/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // JOB FORM
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b bg-indigo-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-indigo-900">{selectedJob.title}</h3>
                            <p className="text-xs text-indigo-700">Reward: ${selectedJob.reward.toFixed(2)}</p>
                        </div>
                        <button onClick={() => { setSelectedJob(null); setSubmitSuccess(false); }} className="text-sm text-gray-500 hover:text-gray-900">Change Job</button>
                    </div>

                    <div className="p-6">
                        {submitSuccess ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Submission Saved!</h3>
                                <Button onClick={() => setSubmitSuccess(false)} className="mt-4"><PlusCircle size={20} className="mr-2"/> Submit Another</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitAccount} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedJob.fields.map((field) => (
                                        <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea 
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    rows={3}
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                    value={dynamicForm[field.label] || ''}
                                                    onChange={e => handleDynamicChange(field.label, e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            ) : (
                                                <input 
                                                    type={field.type}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                    value={dynamicForm[field.label] || ''}
                                                    onChange={e => handleDynamicChange(field.label, e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {error && <div className="text-red-600 text-sm font-bold bg-red-50 p-2 rounded">{error}</div>}
                                <div className="pt-4">
                                    <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : <><Save size={18} /> Submit Data</>}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>

        {/* Right: History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b bg-gray-50"><h3 className="font-bold text-gray-900 flex items-center gap-2"><History size={20}/> History</h3></div>
            <div className="flex-1 overflow-y-auto divide-y">
                {mySubmissions.length === 0 ? <div className="p-8 text-center text-gray-400">No history.</div> : mySubmissions.map(sub => (
                    <div key={sub.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between mb-1">
                            <span className="font-bold text-sm text-gray-900 line-clamp-1">{sub.jobTitle}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${sub.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{sub.status}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between">
                            <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                            <span className="font-mono text-indigo-600 font-bold">${sub.reward.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};
