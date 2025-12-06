
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { createCpaCampaign, getCpaSettings } from '../../../services/mockBackend';
import { CpaType, CpaSettings } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { AlertCircle, CheckCircle, Code, Copy, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COUNTRIES = ['International', 'USA', 'UK', 'Canada', 'Bangladesh', 'India'];

export const CreateCpa: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [settings, setSettings] = useState<CpaSettings | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    type: 'SIGNUP_SIMPLE' as CpaType,
    targetCountries: ['International'],
    payout: 0.10,
    workers: 50, // Default min
    minSeconds: 30 // For ads view
  });

  useEffect(() => {
    const s = getCpaSettings();
    setSettings(s);
    // Set initial values based on settings
    setFormData(prev => ({
        ...prev,
        payout: s.simpleRate,
        workers: s.minWorkers
    }));
  }, []);

  if (!user || !settings) return null;

  // Calculations
  const totalBudget = formData.workers * formData.payout;
  const hasFunds = (user.advertiserBalance || 0) >= totalBudget;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value as CpaType;
      let newRate = settings.simpleRate;
      
      if (newType === 'SIGNUP_COMPLEX') newRate = settings.complexRate;
      if (newType === 'ADS_VIEW') newRate = settings.adsViewRate;

      setFormData(prev => ({
          ...prev,
          type: newType,
          payout: newRate
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.workers < settings.minWorkers) {
        setError(`Minimum workers required: ${settings.minWorkers}`);
        return;
    }

    if (!hasFunds) {
        setError('Insufficient advertiser balance.');
        return;
    }

    try {
        const camp = await createCpaCampaign(user.id, {
            ...formData,
            payoutPerAction: Number(formData.payout),
            budget: totalBudget,
            minSeconds: formData.type === 'ADS_VIEW' ? formData.minSeconds : undefined
        });
        // Deduct balance locally for UI update
        setUser({ ...user, advertiserBalance: (user.advertiserBalance || 0) - totalBudget });
        setCreatedCampaign(camp);
    } catch (err: any) {
        setError(err.message);
    }
  };

  if (createdCampaign) {
      return (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-green-200 shadow-sm">
              <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-green-100 text-green-600 rounded-full mb-3">
                      <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Created!</h2>
                  <p className="text-gray-500">Your tracking pixel is ready.</p>
              </div>

              <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                  <p className="text-green-400 mb-2">// Add this to your landing page 'Thank You' screen or after successful signup</p>
                  <pre>{`<script>
  // TaskRipple Tracking Pixel
  (function(w) {
     const clickId = new URLSearchParams(w.location.search).get('click_id');
     if(clickId) {
        fetch('https://api.taskripple.com/track/conversion', {
           method: 'POST',
           body: JSON.stringify({ pixel_id: '${createdCampaign.pixelId}', click_id: clickId })
        });
     }
  })(window);
</script>`}</pre>
                  <button className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 p-1 rounded text-white" title="Copy">
                      <Copy size={16} />
                  </button>
              </div>

              <div className="mt-6 flex justify-center gap-4">
                  <Button onClick={() => navigate('/advertiser/my-ads')}>Go to My Campaigns</Button>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create CPA / Ads Offer</h2>
      
      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2"><AlertCircle/> {error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                 <label className="block text-sm font-bold mb-1">Offer Title</label>
                 <input required className="w-full border rounded p-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Register & Verify Email" />
             </div>
             <div>
                 <label className="block text-sm font-bold mb-1">Offer Type</label>
                 <select className="w-full border rounded p-2 bg-white" value={formData.type} onChange={handleTypeChange}>
                     <option value="SIGNUP_SIMPLE">Simple Sign Up (Email/Name)</option>
                     <option value="SIGNUP_COMPLEX">Complex Sign Up (KYC/Deposit)</option>
                     <option value="ADS_VIEW">Ads View (Time on Page)</option>
                 </select>
             </div>
         </div>

         {formData.type === 'ADS_VIEW' && (
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                 <label className="block text-sm font-bold mb-1 text-blue-900">Time Required (Seconds)</label>
                 <input 
                    type="number" min="10" 
                    className="w-full border rounded p-2" 
                    value={formData.minSeconds} 
                    onChange={e => setFormData({...formData, minSeconds: Number(e.target.value)})} 
                 />
                 <p className="text-xs text-blue-700 mt-1">User must stay on page for this duration to get paid.</p>
             </div>
         )}

         <div>
             <label className="block text-sm font-bold mb-1">Landing Page URL</label>
             <input type="url" required className="w-full border rounded p-2" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder="https://your-site.com/landing" />
             <p className="text-xs text-gray-500 mt-1">This is where users will be redirected.</p>
         </div>

         <div>
             <label className="block text-sm font-bold mb-1">Description / Instructions</label>
             <textarea required className="w-full border rounded p-2" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Instructions for the worker..." />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
                 <label className="block text-sm font-bold mb-1">Target Country</label>
                 <select className="w-full border rounded p-2 bg-white" value={formData.targetCountries[0]} onChange={e => setFormData({...formData, targetCountries: [e.target.value]})}>
                     {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </div>
             <div>
                 <label className="block text-sm font-bold mb-1">Payout per Action ($)</label>
                 <input type="number" step="0.001" required className="w-full border rounded p-2 bg-gray-50" value={formData.payout} onChange={e => setFormData({...formData, payout: Number(e.target.value)})} />
             </div>
             <div>
                 <label className="block text-sm font-bold mb-1">Workers Needed</label>
                 <input 
                    type="number" step="1" min={settings.minWorkers} 
                    required className="w-full border rounded p-2" 
                    value={formData.workers} 
                    onChange={e => setFormData({...formData, workers: Number(e.target.value)})} 
                 />
                 <p className="text-xs text-gray-500 mt-1">Minimum: {settings.minWorkers}</p>
             </div>
         </div>

         {/* Summary Section */}
         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase">Budget Summary</h4>
            <div className="flex justify-between text-sm mb-2">
                <span>Workers:</span>
                <span className="font-mono">{formData.workers}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
                <span>Payout/Worker:</span>
                <span className="font-mono">${formData.payout.toFixed(3)}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                <span>Total Cost:</span>
                <span className="text-indigo-700">${totalBudget.toFixed(2)}</span>
            </div>
         </div>

         <div className="pt-4 border-t flex justify-between items-center">
             <div className="text-sm text-gray-500">
                 Available Balance: <span className={(user.advertiserBalance || 0) >= totalBudget ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>${(user.advertiserBalance || 0).toFixed(2)}</span>
             </div>
             <Button type="submit" disabled={!hasFunds}>Create Campaign</Button>
         </div>
      </form>
    </div>
  );
};