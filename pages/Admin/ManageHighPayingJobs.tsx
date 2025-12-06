
import React, { useState, useEffect } from 'react';
import { getHighPayingJobs, createHighPayingJob, updateHighPayingJob, deleteHighPayingJob } from '../../services/mockBackend';
import { HighPayingJob, JobField } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ManageHighPayingJobs: React.FC = () => {
  const [jobs, setJobs] = useState<HighPayingJob[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [reward, setReward] = useState(0.20);
  const [fields, setFields] = useState<JobField[]>([]);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = () => {
    setJobs(getHighPayingJobs());
  };

  const openModal = (job?: HighPayingJob) => {
    if (job) {
      setEditingId(job.id);
      setTitle(job.title);
      setStatus(job.status);
      setReward(job.reward);
      setFields(job.fields);
    } else {
      setEditingId(null);
      setTitle('New Job');
      setStatus('ACTIVE');
      setReward(0.20);
      setFields([
          { id: 'f1', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter name' }
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddField = () => {
    const newId = `f${Date.now()}`;
    setFields([...fields, { id: newId, label: '', type: 'text', required: true, placeholder: '' }]);
  };

  const handleRemoveField = (idx: number) => {
    const newFields = [...fields];
    newFields.splice(idx, 1);
    setFields(newFields);
  };

  const handleFieldChange = (idx: number, key: keyof JobField, value: any) => {
    const newFields = [...fields];
    newFields[idx] = { ...newFields[idx], [key]: value };
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, status, reward, fields };
    
    if (editingId) {
      updateHighPayingJob(editingId, payload);
    } else {
      createHighPayingJob({
        id: `hp-job-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...payload
      });
    }
    setIsModalOpen(false);
    loadJobs();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this job permanently?")) {
      deleteHighPayingJob(id);
      loadJobs();
    }
  };

  const handleToggleStatus = (job: HighPayingJob) => {
      const newStatus = job.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      updateHighPayingJob(job.id, { status: newStatus });
      loadJobs();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Manage High Paying Jobs</h2>
           <p className="text-gray-500 text-sm">Create and edit dynamic job forms.</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
             <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                   <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={job.title}>{job.title}</h3>
                   <button onClick={() => handleToggleStatus(job)} title="Toggle Status">
                      {job.status === 'ACTIVE' ? <CheckCircle className="text-green-500"/> : <XCircle className="text-gray-300"/>}
                   </button>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                   <span>Reward: <strong className="text-green-600">${job.reward.toFixed(2)}</strong></span>
                   <span>Fields: {job.fields.length}</span>
                </div>
                <div className="text-xs text-gray-400 font-mono">ID: {job.id}</div>
             </div>
             <div className="bg-gray-50 p-3 border-t flex justify-end gap-2">
                <Button size="sm" variant="secondary" onClick={() => openModal(job)}>
                   <Edit2 size={16} /> Edit
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(job.id)}>
                   <Trash2 size={16} />
                </Button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                 <h3 className="text-xl font-bold">{editingId ? 'Edit Job' : 'Create New Job'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><XCircle className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <form id="jobForm" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold mb-1">Job Title</label>
                          <input required className="w-full border rounded p-2" value={title} onChange={e => setTitle(e.target.value)} />
                       </div>
                       <div>
                          <label className="block text-sm font-bold mb-1">Status</label>
                          <select className="w-full border rounded p-2 bg-white" value={status} onChange={e => setStatus(e.target.value as any)}>
                             <option value="ACTIVE">Active</option>
                             <option value="INACTIVE">Inactive</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-sm font-bold mb-1">Reward ($)</label>
                          <input type="number" step="0.01" required className="w-full border rounded p-2" value={reward} onChange={e => setReward(parseFloat(e.target.value))} />
                       </div>
                    </div>

                    <div className="border-t pt-4">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-700">Form Fields</h4>
                          <Button type="button" size="sm" variant="secondary" onClick={handleAddField}><Plus size={14}/> Add Field</Button>
                       </div>
                       
                       <div className="space-y-3">
                          {fields.map((field, idx) => (
                             <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded border">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                   <input className="border rounded p-1 text-sm" placeholder="Label" value={field.label} onChange={e => handleFieldChange(idx, 'label', e.target.value)} required />
                                   <input className="border rounded p-1 text-sm" placeholder="Placeholder" value={field.placeholder} onChange={e => handleFieldChange(idx, 'placeholder', e.target.value)} />
                                   <select className="border rounded p-1 text-sm bg-white" value={field.type} onChange={e => handleFieldChange(idx, 'type', e.target.value)}>
                                      <option value="text">Text</option>
                                      <option value="number">Number</option>
                                      <option value="email">Email</option>
                                      <option value="password">Password</option>
                                      <option value="tel">Phone</option>
                                      <option value="url">URL</option>
                                      <option value="textarea">Text Area</option>
                                   </select>
                                   <div className="flex items-center gap-2">
                                      <input type="checkbox" checked={field.required} onChange={e => handleFieldChange(idx, 'required', e.target.checked)} />
                                      <span className="text-xs">Required</span>
                                   </div>
                                </div>
                                <button type="button" onClick={() => handleRemoveField(idx)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </form>
              </div>

              <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                 <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                 <Button type="submit" form="jobForm">Save Job</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
