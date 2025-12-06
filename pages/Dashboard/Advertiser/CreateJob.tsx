
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { createAdvertiserJob, getCategories, getSubcategoriesByCategoryId } from '../../../services/mockBackend';
import { Category, Subcategory } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const COUNTRIES = ['International', 'USA', 'UK', 'Canada', 'Australia', 'Bangladesh', 'India', 'Pakistan', 'Philippines', 'Nigeria', 'Kenya', 'Brazil'];

export const CreateJob: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dynamic Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]); // Dynamic List
  
  // Form State
  const [country, setCountry] = useState('International');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [proofType, setProofType] = useState<'TEXT' | 'IMAGE' | 'MIXED'>('IMAGE');
  
  const [workersNeeded, setWorkersNeeded] = useState(20);
  const [workerEarn, setWorkerEarn] = useState(0.020);
  const [duration, setDuration] = useState(24);

  // Load Categories on Mount
  useEffect(() => {
    const cats = getCategories().filter(c => c.status === 'ACTIVE');
    setCategories(cats);
  }, []);

  // Update subcategories dynamically when category changes
  useEffect(() => {
    // 5️⃣ UI Behavior: If category changes → clear old subcategories and load new ones.
    setSelectedSubId('');
    setSubcategories([]);

    if (selectedCatId) {
       // 2️⃣ API / Backend Requirement: Fetch dynamically
       const subs = getSubcategoriesByCategoryId(selectedCatId);
       setSubcategories(subs);
    }
  }, [selectedCatId]);

  // Handle budget updates when subcategory is selected
  useEffect(() => {
      if (selectedSubId) {
         const activeSub = subcategories.find(s => s.id === selectedSubId);
         if (activeSub) {
             setWorkerEarn(Math.max(0.020, activeSub.minBudget));
         }
      }
  }, [selectedSubId, subcategories]);

  // Determine current active subcategory details
  const activeSubcategory = subcategories.find(s => s.id === selectedSubId);
  const minRequiredBudget = activeSubcategory ? activeSubcategory.minBudget : 0.020;

  if (!user) return null;

  // Calculation
  const subTotal = workersNeeded * workerEarn;
  const serviceFee = subTotal * 0.10;
  const totalCost = subTotal + serviceFee;
  
  // Validation Rules
  const isRewardValid = workerEarn >= minRequiredBudget;
  const isTotalValid = totalCost >= 1.00; // Global min job cost
  const hasFunds = (user.advertiserBalance || 0) >= totalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCatId || !selectedSubId) {
      setError('Please select a valid Category and Subcategory.');
      return;
    }

    if (!isRewardValid) {
        setError(`Minimum budget for this subcategory is $${minRequiredBudget.toFixed(3)} per worker.`);
        return;
    }
    if (!isTotalValid) {
        setError('Minimum total job cost must be $1.00');
        return;
    }
    if (!hasFunds) {
        setError('Insufficient Advertiser Balance. Please deposit funds.');
        return;
    }

    const catName = categories.find(c => c.id === selectedCatId)?.name || 'Unknown';
    const subName = activeSubcategory?.name || 'Unknown';

    try {
        await createAdvertiserJob(user.id, {
            title,
            description,
            reward: workerEarn,
            totalBudget: totalCost,
            requirements: steps.split('\n').filter(s => s.trim()),
            proofType,
            category: catName, // Storing names for display simplicity in legacy views
            subcategory: subName,
            targetCountry: country,
            maxWorkers: workersNeeded,
            duration
        });
        
        // Update user context
        setUser({ ...user, advertiserBalance: (user.advertiserBalance || 0) - totalCost });
        setSuccess('Job submitted successfully! Status: Pending Admin Approval.');
        setTimeout(() => navigate('/advertiser/my-ads'), 2500);
    } catch (err: any) {
        setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>

       {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-2"><AlertCircle /> {error}</div>}
       {success && (
         <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex gap-3 border border-yellow-200">
           <div className="bg-white p-1 rounded-full text-yellow-600 h-fit"><CheckCircle size={20} /></div>
           <div>
             <h4 className="font-bold">Job Submitted!</h4>
             <p className="text-sm mt-1">{success}</p>
             <p className="text-xs text-yellow-700 mt-1">Admin will review your job before it goes live.</p>
           </div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
             {/* Targeting */}
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">1. Select Zone</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold mb-1">Target Country</label>
                     <select className="w-full border rounded p-2" value={country} onChange={e => setCountry(e.target.value)}>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">2. Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-semibold mb-1">Category</label>
                     <select 
                       className="w-full border rounded p-2" 
                       value={selectedCatId} 
                       onChange={e => setSelectedCatId(e.target.value)}
                     >
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Subcategory</label>
                     <select 
                       className="w-full border rounded p-2" 
                       value={selectedSubId} 
                       onChange={e => setSelectedSubId(e.target.value)}
                       disabled={!selectedCatId}
                     >
                        <option value="">Select Subcategory</option>
                        {subcategories.length > 0 ? (
                            subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                        ) : (
                            selectedCatId && <option disabled>No subcategories available for this category</option>
                        )}
                     </select>
                   </div>
                </div>
                {activeSubcategory && (
                  <div className="mt-3 bg-blue-50 text-blue-700 text-xs p-2 rounded flex items-center gap-2">
                    <Info size={14} /> 
                    Minimum Budget for this category: <strong>${activeSubcategory.minBudget.toFixed(3)}</strong>
                  </div>
                )}
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">3. Job Details</h3>
                <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold mb-1">Job Title</label>
                     <input 
                        className="w-full border rounded p-2" 
                        placeholder="e.g. Subscribe my channel" 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Description</label>
                     <textarea 
                        className="w-full border rounded p-2" 
                        rows={3}
                        placeholder="Explain what the user needs to do..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Steps (One per line)</label>
                     <textarea 
                        className="w-full border rounded p-2 bg-gray-50" 
                        rows={4}
                        placeholder="1. Go to link...&#10;2. Click subscribe...&#10;3. Take screenshot..."
                        value={steps}
                        onChange={e => setSteps(e.target.value)}
                     />
                     <p className="text-xs text-gray-500 mt-1">Each step will be shown as a checklist to workers.</p>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Proof Required</label>
                     <select className="w-full border rounded p-2" value={proofType} onChange={e => setProofType(e.target.value as any)}>
                        <option value="IMAGE">Image Proof</option>
                        <option value="TEXT">Text Proof</option>
                        <option value="MIXED">Text + Image Proof</option>
                     </select>
                   </div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">4. Budget & Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-sm font-semibold mb-1">Workers Needed</label>
                     <input 
                        type="number" min="1"
                        className="w-full border rounded p-2" 
                        value={workersNeeded}
                        onChange={e => setWorkersNeeded(parseInt(e.target.value) || 0)}
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Worker Earn ($)</label>
                     <input 
                        type="number" step="0.001" min="0.001"
                        className={`w-full border rounded p-2 ${!isRewardValid ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`} 
                        value={workerEarn}
                        onChange={e => setWorkerEarn(parseFloat(e.target.value) || 0)}
                     />
                     {!isRewardValid && (
                       <p className="text-xs text-red-600 mt-1 font-bold">Must be at least ${minRequiredBudget.toFixed(3)}</p>
                     )}
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-1">Duration (Hours)</label>
                     <input 
                        type="number" min="1"
                        className="w-full border rounded p-2" 
                        value={duration}
                        onChange={e => setDuration(parseInt(e.target.value) || 24)}
                     />
                   </div>
                </div>
             </div>
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl border border-indigo-200 shadow-lg sticky top-6 overflow-hidden">
                <div className="bg-indigo-900 p-4 text-white">
                   <h3 className="font-bold text-lg">SUMMARY</h3>
                </div>
                <div className="p-6 space-y-4 text-sm">
                   <div className="flex justify-between">
                      <span className="text-gray-500">Zone</span>
                      <span className="font-bold text-gray-900">{country}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-bold text-gray-900 text-right">{categories.find(c => c.id === selectedCatId)?.name}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Subcategory</span>
                      <span className="font-bold text-gray-900 text-right">{activeSubcategory?.name}</span>
                   </div>
                   <div className="border-t border-dashed my-2"></div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Workers Needed</span>
                      <span className="font-bold text-gray-900">{workersNeeded}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-500">Worker Earn</span>
                      <span className="font-bold text-gray-900">${workerEarn.toFixed(3)}</span>
                   </div>
                   <div className="border-t border-dashed my-2"></div>
                   <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${subTotal.toFixed(3)}</span>
                   </div>
                   <div className="flex justify-between text-gray-600">
                      <span>Service Fee (10%)</span>
                      <span>${serviceFee.toFixed(3)}</span>
                   </div>
                   <div className="bg-indigo-50 p-3 rounded-lg flex justify-between items-center mt-2">
                      <span className="text-indigo-900 font-bold">Total Job Cost</span>
                      <span className="text-2xl font-extrabold text-indigo-700">${totalCost.toFixed(3)}</span>
                   </div>
                   
                   {!isTotalValid && (
                      <p className="text-red-600 text-xs text-center font-bold">Minimum job cost is $1.000</p>
                   )}
                   
                   <div className="pt-2">
                      <div className="flex justify-between text-xs mb-2">
                         <span>Your Ad Balance:</span>
                         <span className={hasFunds ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>${(user.advertiserBalance || 0).toFixed(3)}</span>
                      </div>
                      <Button onClick={handleSubmit} className="w-full py-3" disabled={!isRewardValid || !hasFunds || !isTotalValid}>
                         Submit Job
                      </Button>
                      {!hasFunds && (
                        <p className="text-xs text-red-600 text-center mt-2 cursor-pointer hover:underline" onClick={() => navigate('/advertiser/deposit')}>Click here to deposit funds</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
