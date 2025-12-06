
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getTasks, getSubmissions, getCpaCampaigns } from '../../../services/mockBackend';
import { Task, TaskSubmission, CpaCampaign } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { BarChart2, CheckCircle, Clock, XCircle, Users, Search, Briefcase, MousePointerClick } from 'lucide-react';

export const MyAds: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'JOBS' | 'CPA'>('JOBS');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cpas, setCpas] = useState<CpaCampaign[]>([]);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      // Load Tasks
      const allTasks = getTasks().filter(t => t.creatorId === user.id);
      setTasks(allTasks.reverse());

      // Load CPA Campaigns
      const allCpas = getCpaCampaigns().filter(c => c.creatorId === user.id);
      setCpas(allCpas.reverse());
    }
  }, [user]);

  const openAnalytics = (task: Task) => {
    const submissions = getSubmissions().filter(s => s.taskId === task.id);
    const approved = submissions.filter(s => s.status === 'APPROVED').length;
    const rejected = submissions.filter(s => s.status === 'REJECTED').length;
    const pending = submissions.filter(s => s.status === 'PENDING').length;

    setAnalytics({
       submissions,
       approved,
       rejected,
       pending,
       remaining: task.maxWorkers - approved,
       totalCost: task.totalBudget,
       impressions: task.maxWorkers * (Math.floor(Math.random() * 5) + 2) 
    });
    setSelectedTask(task);
  };

  if (!user) return null;

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCpas = cpas.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
             <input 
                 type="text"
                 placeholder="Search ID or Title..."
                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit">
         <button 
            onClick={() => setActiveTab('JOBS')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'JOBS' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
         >
            <Briefcase size={16} /> Micro Jobs
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{tasks.length}</span>
         </button>
         <button 
            onClick={() => setActiveTab('CPA')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'CPA' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
         >
            <MousePointerClick size={16} /> CPA / Ads
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">{cpas.length}</span>
         </button>
      </div>

      {/* JOBS TABLE */}
      {activeTab === 'JOBS' && (
        tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
               <p className="text-gray-500">You haven't posted any micro jobs yet.</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500">
                        <tr>
                           <th className="px-6 py-4">Job Title & ID</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Workers</th>
                           <th className="px-6 py-4">Cost</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredTasks.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No jobs found.</td></tr>
                        ) : (
                            filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{task.title}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {task.id}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(task.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        task.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        task.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {task.status === 'APPROVED' ? 'Active / Live' : task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {task.maxWorkers}
                                </td>
                                <td className="px-6 py-4 font-mono font-bold">
                                    ${task.totalBudget?.toFixed(3)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" variant="secondary" onClick={() => openAnalytics(task)}>
                                        <BarChart2 size={16} className="mr-1" /> Analytics
                                    </Button>
                                </td>
                            </tr>
                            ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
        )
      )}

      {/* CPA TABLE */}
      {activeTab === 'CPA' && (
        cpas.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
               <p className="text-gray-500">You haven't posted any CPA/Ads offers yet.</p>
            </div>
        ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-500">
                        <tr>
                           <th className="px-6 py-4">Offer Title & ID</th>
                           <th className="px-6 py-4">Type</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Payout / Action</th>
                           <th className="px-6 py-4">Budget Spent</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {filteredCpas.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No offers found.</td></tr>
                        ) : (
                            filteredCpas.map(cpa => (
                            <tr key={cpa.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{cpa.title}</p>
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {cpa.id}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(cpa.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                        {cpa.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        cpa.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                        cpa.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                        cpa.status === 'PAUSED' ? 'bg-gray-200 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {cpa.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-green-600">
                                    ${cpa.payoutPerAction.toFixed(3)}
                                </td>
                                <td className="px-6 py-4">
                                    <div>
                                        <span className="font-bold text-gray-900">${cpa.spent.toFixed(2)}</span>
                                        <span className="text-gray-400 text-xs"> / ${cpa.budget.toFixed(2)}</span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                        <div 
                                            className={`h-full ${cpa.spent >= cpa.budget ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${Math.min((cpa.spent / cpa.budget) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </td>
                            </tr>
                            ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
        )
      )}

      {/* Task Analytics Modal */}
      {selectedTask && analytics && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-indigo-900 p-6 text-white flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                    <p className="text-indigo-200 text-sm">Campaign Analytics (ID: {selectedTask.id})</p>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="text-indigo-200 hover:text-white"><XCircle size={28} /></button>
              </div>
              
              <div className="p-8">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-gray-50 rounded-xl border">
                       <p className="text-xs text-gray-500 uppercase font-bold">Impressions</p>
                       <p className="text-2xl font-bold text-gray-900">{analytics.impressions}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border">
                       <p className="text-xs text-gray-500 uppercase font-bold">Workers Needed</p>
                       <p className="text-2xl font-bold text-indigo-600">{selectedTask.maxWorkers}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl border">
                       <p className="text-xs text-gray-500 uppercase font-bold">Total Cost</p>
                       <p className="text-2xl font-bold text-green-600">${analytics.totalCost?.toFixed(3)}</p>
                    </div>
                 </div>

                 <h4 className="font-bold text-gray-900 mb-4">Submission Status</h4>
                 <div className="grid grid-cols-3 gap-4">
                     <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col items-center">
                        <Clock className="text-yellow-600 mb-2" />
                        <span className="text-2xl font-bold text-gray-900">{analytics.pending}</span>
                        <span className="text-xs text-yellow-700 font-bold uppercase">Pending</span>
                     </div>
                     <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center">
                        <CheckCircle className="text-green-600 mb-2" />
                        <span className="text-2xl font-bold text-gray-900">{analytics.approved}</span>
                        <span className="text-xs text-green-700 font-bold uppercase">Approved</span>
                     </div>
                     <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center">
                        <XCircle className="text-red-600 mb-2" />
                        <span className="text-2xl font-bold text-gray-900">{analytics.rejected}</span>
                        <span className="text-xs text-red-700 font-bold uppercase">Rejected</span>
                     </div>
                 </div>

                 <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
                    <p>Remaining slots: <span className="font-bold text-gray-900">{analytics.remaining}</span></p>
                    <p className="mt-1 text-xs">Admin reviews all submissions for quality assurance.</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
