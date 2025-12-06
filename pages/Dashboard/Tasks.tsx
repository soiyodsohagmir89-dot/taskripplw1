

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTasks, getSubmissions, submitTask } from '../../services/mockBackend';
import { Task, TaskSubmission, AccountStatus, TaskCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Lock, Filter, ArrowUpDown, Tag, Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { user, setUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState('');
  
  // Filter & Sort State
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    if (user) {
      // FIX ISSUE 3: Only show APPROVED tasks to workers
      // Strictly filtering by status='APPROVED'. Pending/Rejected tasks are hidden.
      const allTasks = getTasks();
      const approvedTasks = allTasks.filter(t => t.status === 'APPROVED');
      setTasks(approvedTasks);
      
      setSubmissions(getSubmissions().filter(s => s.userId === user.id));
    }
  }, [user]);

  if (!user) return null;

  if (user.status !== AccountStatus.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="bg-gray-200 p-4 rounded-full mb-4">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tasks Locked</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          You must activate your account by paying the one-time fee to access tasks and start earning.
        </p>
      </div>
    );
  }

  const getTaskStatus = (taskId: string) => {
    const sub = submissions.find(s => s.taskId === taskId);
    return sub ? sub.status : null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation: Max 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please upload a smaller image.");
        e.target.value = ''; // Reset input
        return;
      }
      // Validation: Image type
      if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file (PNG, JPG, JPEG).");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    
    // Manual validation for mixed/image types to ensure file is selected
    if ((activeTask.proofType === 'IMAGE' || activeTask.proofType === 'MIXED') && !proofImage) {
        alert("Please upload a proof screenshot.");
        return;
    }

    try {
      await submitTask(user.id, activeTask.id, { text: proofText, image: proofImage });
      setSubmissions(getSubmissions().filter(s => s.userId === user.id));
      setActiveTask(null);
      setProofText('');
      setProofImage('');
    } catch (err) {
      alert('Failed to submit');
    }
  };

  // Process tasks based on filters
  const filteredTasks = tasks
    .filter(task => filterType === 'ALL' || task.proofType === filterType)
    .filter(task => filterCategory === 'ALL' || task.category === filterCategory)
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.reward - b.reward;
      return b.reward - a.reward;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Available Tasks</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.values(TaskCategory).map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Proof Types</option>
              <option value="IMAGE">Image Only</option>
              <option value="TEXT">Text Only</option>
              <option value="MIXED">Mixed</option>
            </select>
          </div>
          
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select 
              className="w-full sm:w-auto pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white cursor-pointer"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Highest Reward</option>
              <option value="asc">Lowest Reward</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            No tasks available matching your filters.
          </div>
        ) : (
          filteredTasks.map(task => {
            const status = getTaskStatus(task.id);
            return (
              <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                      ${task.reward.toFixed(3)}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Tag size={10} /> {task.category || 'General'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
                      Proof: {task.proofType}
                    </span>
                    {task.requirements.map((req, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{req}</span>
                    ))}
                  </div>
                </div>

                <div>
                  {status ? (
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {status}
                    </span>
                  ) : (
                    <Button onClick={() => { setActiveTask(task); setProofImage(''); setProofText(''); }}>Start Task</Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Submission Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium uppercase tracking-wide">
                        {activeTask.category}
                     </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submit Proof: {activeTask.title}</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TEXT PROOF */}
              {(activeTask.proofType === 'TEXT' || activeTask.proofType === 'MIXED') && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Text Proof</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" 
                    rows={3}
                    value={proofText}
                    onChange={e => setProofText(e.target.value)}
                    required
                    placeholder="Type your proof here..."
                  />
                </div>
              )}

              {/* IMAGE PROOF - FILE UPLOAD */}
              {(activeTask.proofType === 'IMAGE' || activeTask.proofType === 'MIXED') && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Proof Screenshot</label>
                  
                  {!proofImage ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        required={activeTask.proofType === 'IMAGE' || activeTask.proofType === 'MIXED'}
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Click to Upload Screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-gray-200 rounded-lg p-2 bg-gray-50">
                       <img 
                          src={proofImage} 
                          alt="Proof Preview" 
                          className="w-full h-48 object-contain rounded-md bg-white border border-gray-100" 
                       />
                       <button
                         type="button"
                         onClick={() => setProofImage('')}
                         className="absolute top-3 right-3 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-red-50"
                         title="Remove Image"
                       >
                         <X size={16} />
                       </button>
                       <div className="flex items-center gap-2 mt-2 px-1 text-xs text-green-600 font-bold">
                          <CheckCircle size={14} className="text-green-600" /> Image Selected
                       </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <Button variant="secondary" type="button" onClick={() => setActiveTask(null)}>Cancel</Button>
                <Button type="submit">Submit Proof</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};