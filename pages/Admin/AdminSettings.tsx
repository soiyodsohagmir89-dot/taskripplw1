import React, { useEffect, useState } from 'react';
import { getPaymentSettings, updatePaymentSettings, getCpaSettings, updateCpaSettings, getReferralSettings, updateReferralSettings, getResourceSettings, updateResourceSettings, getSocialSettings, updateSocialSettings } from '../../services/mockBackend';
import { PaymentSettings, CpaSettings, ReferralSettings, ResourceSettings, SocialSettings } from '../../types';
import { Button } from '../../components/ui/Button';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [cpaSettings, setCpaSettings] = useState<CpaSettings | null>(null);
  const [refSettings, setRefSettings] = useState<ReferralSettings | null>(null);
  const [resourceSettings, setResourceSettings] = useState<ResourceSettings | null>(null);
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setSettings(getPaymentSettings());
    setCpaSettings(getCpaSettings());
    setRefSettings(getReferralSettings());
    setResourceSettings(getResourceSettings());
    setSocialSettings(getSocialSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    }
  };

  const handleCpaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cpaSettings) {
        setCpaSettings({ ...cpaSettings, [e.target.name]: parseFloat(e.target.value) });
    }
  };

  const handleRefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (refSettings) {
        setRefSettings({ ...refSettings, [e.target.name]: parseFloat(e.target.value) });
    }
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (resourceSettings) {
        setResourceSettings({ ...resourceSettings, downloadLink: e.target.value });
    }
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (socialSettings) {
        setSocialSettings({ ...socialSettings, [e.target.name]: e.target.value });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings && cpaSettings && refSettings && resourceSettings && socialSettings) {
        updatePaymentSettings(settings);
        updateCpaSettings(cpaSettings);
        updateReferralSettings(refSettings);
        updateResourceSettings(resourceSettings);
        updateSocialSettings(socialSettings);
        setMsg('Settings updated successfully!');
        setTimeout(() => setMsg(''), 3000);
    }
  };

  if (!settings || !cpaSettings || !refSettings || !resourceSettings || !socialSettings) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
       {msg && <div className="bg-green-50 text-green-700 p-3 rounded">{msg}</div>}

       <form onSubmit={handleSave} className="space-y-6">
         
         {/* Free Resources Settings */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">Free Digital Resources</h3>
            <div>
               <label className="block text-sm font-medium mb-1">Download Link (Google Drive)</label>
               <input 
                 name="downloadLink"
                 type="url"
                 className="w-full border rounded p-2"
                 value={resourceSettings.downloadLink}
                 onChange={handleResourceChange}
                 placeholder="https://drive.google.com/..."
               />
               <p className="text-xs text-gray-500 mt-1">This link will be accessed by Verified Users in the 'Free Resources' section.</p>
            </div>
         </div>

         {/* Social Links Manager */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">Social Links Manager</h3>
            <p className="text-sm text-gray-500 mb-4">Leave field empty to hide the button on homepage/footer.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Facebook URL</label>
                   <input 
                     name="facebook"
                     type="text"
                     className="w-full border rounded p-2"
                     value={socialSettings.facebook}
                     onChange={handleSocialChange}
                     placeholder="#"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Instagram URL</label>
                   <input 
                     name="instagram"
                     type="text"
                     className="w-full border rounded p-2"
                     value={socialSettings.instagram}
                     onChange={handleSocialChange}
                     placeholder="#"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Twitter (X) URL</label>
                   <input 
                     name="twitter"
                     type="text"
                     className="w-full border rounded p-2"
                     value={socialSettings.twitter}
                     onChange={handleSocialChange}
                     placeholder="#"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">YouTube URL</label>
                   <input 
                     name="youtube"
                     type="text"
                     className="w-full border rounded p-2"
                     value={socialSettings.youtube}
                     onChange={handleSocialChange}
                     placeholder="#"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                   <input 
                     name="linkedin"
                     type="text"
                     className="w-full border rounded p-2"
                     value={socialSettings.linkedin}
                     onChange={handleSocialChange}
                     placeholder="#"
                   />
                </div>
            </div>
         </div>

         {/* Referral Commission Settings */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">5-Generation Referral Commissions ($)</h3>
            <p className="text-sm text-gray-500 mb-4">Amounts are credited to the upline automatically when a downline account is active.</p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                   <label className="block text-xs font-bold mb-1">Level 1 (Direct)</label>
                   <input 
                     name="level1"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={refSettings.level1}
                     onChange={handleRefChange}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold mb-1">Level 2</label>
                   <input 
                     name="level2"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={refSettings.level2}
                     onChange={handleRefChange}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold mb-1">Level 3</label>
                   <input 
                     name="level3"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={refSettings.level3}
                     onChange={handleRefChange}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold mb-1">Level 4</label>
                   <input 
                     name="level4"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={refSettings.level4}
                     onChange={handleRefChange}
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold mb-1">Level 5</label>
                   <input 
                     name="level5"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={refSettings.level5}
                     onChange={handleRefChange}
                   />
                </div>
            </div>
         </div>

         {/* CPA Settings */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-indigo-900">CPA / Ads Offer Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1">Simple Sign Up Rate ($)</label>
                   <input 
                     name="simpleRate"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={cpaSettings.simpleRate}
                     onChange={handleCpaChange}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Complex Sign Up Rate ($)</label>
                   <input 
                     name="complexRate"
                     type="number" step="0.01"
                     className="w-full border rounded p-2"
                     value={cpaSettings.complexRate}
                     onChange={handleCpaChange}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Ads View Base Rate ($)</label>
                   <input 
                     name="adsViewRate"
                     type="number" step="0.001"
                     className="w-full border rounded p-2"
                     value={cpaSettings.adsViewRate}
                     onChange={handleCpaChange}
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1">Minimum Workers Per Job</label>
                   <input 
                     name="minWorkers"
                     type="number" 
                     className="w-full border rounded p-2 bg-yellow-50"
                     value={cpaSettings.minWorkers}
                     onChange={handleCpaChange}
                   />
                </div>
            </div>
         </div>

         {/* Payment Settings */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="font-bold text-lg mb-4 text-indigo-900">Deposit & Fees</h3>
           <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Exchange Rate ($1 = ? BDT)</label>
                     <input 
                       name="rate"
                       type="number"
                       className="w-full border rounded p-2 bg-gray-50"
                       value={settings.rate}
                       onChange={e => setSettings({...settings, rate: Number(e.target.value)})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1 text-green-700 font-bold">Account Activation Fee ($)</label>
                     <input 
                       name="activationFee"
                       type="number"
                       className="w-full border border-green-500 rounded p-2 bg-green-50 font-bold"
                       value={settings.activationFee}
                       onChange={e => setSettings({...settings, activationFee: Number(e.target.value)})}
                     />
                  </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Payment Gateway Numbers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium mb-1">Bkash Number</label>
                         <input 
                           name="bkash"
                           className="w-full border rounded p-2"
                           value={settings.bkash}
                           onChange={handleChange}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium mb-1">Nagad Number</label>
                         <input 
                           name="nagad"
                           className="w-full border rounded p-2"
                           value={settings.nagad}
                           onChange={handleChange}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium mb-1">Rocket Number</label>
                         <input 
                           name="rocket"
                           className="w-full border rounded p-2"
                           value={settings.rocket}
                           onChange={handleChange}
                         />
                      </div>
                      <div>
                         <label className="block text-sm font-medium mb-1">Binance ID/Wallet</label>
                         <input 
                           name="binance"
                           className="w-full border rounded p-2"
                           value={settings.binance}
                           onChange={handleChange}
                         />
                      </div>
                  </div>
              </div>
           </div>
         </div>

         <Button type="submit" className="w-full py-3 text-lg">Save All Changes</Button>
       </form>
    </div>
  );
};