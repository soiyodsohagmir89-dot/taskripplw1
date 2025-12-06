import React, { useState, useEffect } from 'react';
import { Task } from '../../types';
import { getTasks, createTask, deleteTask, adminApproveTask, adminRejectTask, getUserName, getCategories } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Trash2, Plus, X, Check, CheckCircle, AlertCircle, Search, Eye, ListOrdered } from 'lucide-react';

export const ManageTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Animation State
  const [fadingTaskIds, setFadingTaskIds] = useState<Set<string>>(new Set());

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0.10,
    steps: '',
    proofType: 'IMAGE' as Task['proofType'],
    category: 'Social Media',
    workers: 25,
  });

  // Load Categories for dropdown
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    loadTasks();
    const cats = getCategories();
    setAvailableCategories(cats.map(c => c.name));
  }, []);

  const loadTasks = () => {
    const loadedTasks = getTasks().reverse();
    setTasks(loadedTasks);
  };

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3000);
  };

  // 3️⃣ DYNAMIC DELETE JOB
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      // 1. Mark as fading
      setFadingTaskIds(prev => new Set(prev).add(id));
      
      // 2. Animate and remove
      setTimeout(() => {
          try {
              deleteTask(id);
              showMsg('success', 'Task deleted successfully.');
              setTasks(prev => prev.filter(t => t.id !== id));
          } catch (e: any) {
              showMsg('error', 'Failed to delete task.');
          }
          
          setFadingTaskIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
          });
      }, 500); // Wait for fade out
    }
  };

  // 1️⃣ DYNAMIC ONE-CLICK APPROVE
  const handleApprove = async (id: string) => {
    // Instant Frontend Update
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'APPROVED' };
      }
      return t;
    }));
    
    // Show toast
    showMsg('success', 'Task Approved Instantly');

    // Background Backend Update
    try {
        await adminApproveTask(id);
        if (viewTask?.id === id) setViewTask(prev => prev ? { ...prev, status: 'APPROVED' } : null);
    } catch (e: any) {
        console.error("Backend sync failed", e);
    }
  };

  // 2️⃣ DYNAMIC ONE-CLICK REJECT
  const handleReject = async (id: string) => {
    // Instant Frontend Update
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: 'REJECTED' };
      }
      return t;
    }));
    
    showMsg('success', 'Task Rejected. Funds Refunded.');

    try {
        await adminRejectTask(id);
        if (viewTask?.id === id) setViewTask(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    } catch (e: any) {
        console.error("Backend sync failed", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: formData.title,
      description: formData.description,
      reward: Number(formData.reward),
      totalBudget: Number(formData.reward) * Number(formData.workers),
      requirements: formData.steps.split('\n').filter(r => r.trim() !== ''),
      proofType: formData.proofType,
      category: formData.category,
      maxWorkers: Number(formData.workers),
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    };
    createTask(newTask);
    setIsCreateModalOpen(false);
    showMsg('success', 'Admin Campaign Created successfully.');
    setFormData({ 
      title: '', description: '', reward: 0.10, steps: '', proofType: 'IMAGE', category: 'Social Media', workers: 25 
    });
    setTasks(prev => [newTask, ...prev]);
  };

  const filteredTasks = tasks.filter(t => {
      if (filter === 'ALL') return true; 
      const matchStatus = t.status === filter;
      const term = searchTerm.toLowerCase();
      const matchSearch = t.title.toLowerCase().includes(term) || 
                          (t.creatorId || '').toLowerCase().includes(term) ||
                          t.id.toLowerCase().includes(term);
      return matchStatus && matchSearch;
  });

  const getRowClass = (status?: string, id?: string) => {
    if (id && fadingTaskIds.has(id)) {
        return 'bg-red-50 border-l-4 border-l-red-500 opacity-0 transform -translate-x-full transition-all duration-500';
    }

    if (status === 'APPROVED') return 'bg-green-50 border-l-4 border-l-green-500 transition-colors duration-300';
    if (status === 'REJECTED') return 'bg-red-50 border-l-4 border-l-red-500 transition-colors duration-300';
    if (status === 'PENDING' || !status) return 'bg-yellow-50 border-l-4 border-l-yellow-400 transition-colors duration-300';
    return 'bg-white border-l-4 border-l-transparent transition-colors duration-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Jobs</h2>
          <p className="text-gray-500 text-sm">Review pending jobs and manage active campaigns.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Search Task ID, Title, Creator..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="shadow-lg shrink-0">
               <Plus className="w-4 h-4 mr-2" /> New
            </Button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 font-medium animate-in fade-in slide-in-from-top-5 ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
         {[
           {id: 'PENDING', label: 'Pending Approval', count: tasks.filter(t => t.status === 'PENDING').length},
           {id: 'APPROVED', label: 'Live / Approved', count: tasks.filter(t => t.status === 'APPROVED').length},
           {id: 'REJECTED', label: 'Rejected', count: tasks.filter(t => t.status === 'REJECTED').length},
           {id: 'ALL', label: 'All Jobs', count: tasks.length}
         ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setFilter(tab.id as any)}
               className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                 filter === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
               }`}
             >
               {tab.label}
               <span className={`px-1.5 py-0.5 rounded-full text-xs ${filter === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                  {tab.count}
               </span>
             </button>
         ))}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
                <tr>
                <th className="px-6 py-3 font-medium">Job Details</th>
                <th className="px-6 py-3 font-medium">Creator</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filteredTasks.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-500">No jobs found in this section.</td></tr>
                ) : (
                    filteredTasks.map(task => (
                    <tr key={task.id} className={getRowClass(task.status, task.id)}>
                        <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 line-clamp-1 text-base">{task.title}</p>
                        <div className="text-xs text-gray-400 font-mono mt-0.5 mb-1">ID: {task.id}</div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                {task.category || 'Other'}
                            </span>
                            {task.subcategory && (
                              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                {task.subcategory}
                              </span>
                            )}
                        </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">{task.creatorId ? getUserName(task.creatorId) : 'Admin'}</div>
                            <div className="text-xs font-mono text-gray-500">{task.creatorId || 'System'}</div>
                        </td>
                        <td className="px-6 py-4">
                             {/* Status Badge */}
                             <span className={`px-2 py-1 rounded-full text-xs font-bold ${task.status === 'APPROVED' ? 'bg-green-100 text-green-700' : task.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                               {task.status}
                             </span>
                        </td>
                        <td className="px-6 py-4">
                             <div className="font-bold text-gray-900">${task.totalBudget?.toFixed(2) || '0.00'}</div>
                             <div className="text-xs text-green-600 font-medium">${task.reward.toFixed(3)} / task</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="secondary" onClick={() => setViewTask(task)} title="View Details" disabled={fadingTaskIds.has(task.id)}>
                                   <Eye size={16} />
                                </Button>
                                
                                {/* Dynamic Action Buttons */}
                                {task.status === 'PENDING' && (
                                  <>
                                    <Button 
                                       size="sm" 
                                       onClick={() => handleApprove(task.id)} 
                                       className="bg-green-600 text-white hover:bg-green-700"
                                       disabled={fadingTaskIds.has(task.id)}
                                    >
                                      <Check size={16} />
                                    </Button>
                                    <Button 
                                       size="sm" 
                                       variant="danger" 
                                       onClick={() => handleReject(task.id)}
                                       disabled={fadingTaskIds.has(task.id)}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </>
                                )}
                                
                                {task.status === 'APPROVED' && (
                                     <Button 
                                       size="sm" 
                                       variant="danger" 
                                       onClick={() => handleReject(task.id)}
                                       title="Revoke / Reject"
                                       disabled={fadingTaskIds.has(task.id)}
                                     >
                                      <X size={16} />
                                    </Button>
                                )}
                                
                                <button 
                                   onClick={() => handleDelete(task.id)} 
                                   className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                   disabled={fadingTaskIds.has(task.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* View Task Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
             <div className="bg-gray-50 px-8 py-6 border-b flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-bold text-gray-900">{viewTask.title}</h3>
                 <p className="text-gray-500 text-sm mt-1">ID: {viewTask.id}</p>
                 <div className="flex gap-2 mt-2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold">{viewTask.category}</span>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{viewTask.subcategory || 'General'}</span>
                 </div>
               </div>
               <button onClick={() => setViewTask(null)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
             </div>
             
             <div className="p-8 space-y-6">
                <div>
                   <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                   <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border">{viewTask.description}</p>
                </div>
                
                <div>
                   <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><ListOrdered size={18}/> Steps Required</h4>
                   <ol className="list-decimal list-inside space-y-2 bg-gray-50 p-4 rounded-lg border">
                      {viewTask.requirements.map((step, i) => (
                        <li key={i} className="text-gray-700 border-b border-dashed border-gray-200 last:border-0 pb-1 last:pb-0">{step}</li>
                      ))}
                   </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-xs text-indigo-600 font-bold uppercase">Worker Pay</p>
                      <p className="text-xl font-bold text-indigo-900">${viewTask.reward.toFixed(3)}</p>
                   </div>
                   <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-green-600 font-bold uppercase">Total Budget</p>
                      <p className="text-xl font-bold text-green-900">${viewTask.totalBudget?.toFixed(2)}</p>
                   </div>
                </div>

                {viewTask.status === 'PENDING' && (
                  <div className="flex gap-4 pt-4 border-t">
                     <Button className="flex-1 py-3 bg-green-600 hover:bg-green-700" onClick={() => { handleApprove(viewTask.id); }}>
                        Approve Job
                     </Button>
                     <Button className="flex-1 py-3" variant="danger" onClick={() => { handleReject(viewTask.id); }}>
                        Reject Job
                     </Button>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
             <div className="px-8 py-5 border-b flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-xl">Create Admin Task</h3>
               <button onClick={() => setIsCreateModalOpen(false)}><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Form fields same as before but using dynamic category state if needed, simplified for admin quick add */}
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Job Title</label>
                    <input className="w-full border rounded p-2" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select className="w-full border rounded p-2 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                       {availableCategories.length > 0 ? availableCategories.map(c => <option key={c} value={c}>{c}</option>) : <option>General</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Description</label>
                    <textarea className="w-full border rounded p-2" rows={2} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Steps (Line separated)</label>
                    <textarea className="w-full border rounded p-2" rows={4} required value={formData.steps} onChange={e => setFormData({...formData, steps: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold mb-1">Worker Pay</label>
                        <input type="number" step="0.001" className="w-full border rounded p-2" required value={formData.reward} onChange={e => setFormData({...formData, reward: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold mb-1">Total Workers</label>
                        <input type="number" className="w-full border rounded p-2" required value={formData.workers} onChange={e => setFormData({...formData, workers: Number(e.target.value)})} />
                     </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                   <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                   <Button type="submit">Create Task</Button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};