

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, getReferralSettings } from '../../services/mockBackend';
import { Copy, Users, Network } from 'lucide-react';
import { ReferralSettings } from '../../types';

export const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [network, setNetwork] = useState<{level: number, users: any[]}[]>([]);
  const [rates, setRates] = useState<ReferralSettings>({ level1: 5, level2: 4, level3: 3, level4: 2, level5: 1 });

  useEffect(() => {
    if (!user) return;
    
    // Load Settings
    setRates(getReferralSettings());

    const allUsers = getUsers();
    
    // Calculate network levels relative to current user
    // In our new system, users have a 'referralChain' array.
    // If user.id is at index 0 of someone's chain -> that person is Level 1
    // If user.id is at index 1 -> Level 2, etc.
    
    const levels = [
        { level: 1, users: allUsers.filter(u => u.referralChain?.[0] === user.id) },
        { level: 2, users: allUsers.filter(u => u.referralChain?.[1] === user.id) },
        { level: 3, users: allUsers.filter(u => u.referralChain?.[2] === user.id) },
        { level: 4, users: allUsers.filter(u => u.referralChain?.[3] === user.id) },
        { level: 5, users: allUsers.filter(u => u.referralChain?.[4] === user.id) },
    ];
    setNetwork(levels);

  }, [user]);

  if (!user) return null;
  
  const refLink = `${window.location.origin}/#/signup?ref=${user.referralCode}`;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg text-white text-center">
        <h2 className="text-3xl font-bold mb-2">5-Generation Referral System</h2>
        <p className="text-indigo-100 mb-6">Earn passive income from 5 levels of your network!</p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <code className="text-sm font-mono break-all">{refLink}</code>
          <button 
            onClick={() => { navigator.clipboard.writeText(refLink); alert('Copied!'); }} 
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
          >
            <Copy size={16} /> Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Commission Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Network size={20} className="text-indigo-600"/> Commission Rates</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between p-2 bg-indigo-50 rounded border border-indigo-100">
                <span className="font-medium text-gray-700">Level 1 (Direct)</span> 
                <span className="font-bold text-green-600">${rates.level1.toFixed(2)}</span>
            </li>
            <li className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span>Level 2</span> <span className="font-bold text-gray-800">${rates.level2.toFixed(2)}</span>
            </li>
            <li className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span>Level 3</span> <span className="font-bold text-gray-800">${rates.level3.toFixed(2)}</span>
            </li>
            <li className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span>Level 4</span> <span className="font-bold text-gray-800">${rates.level4.toFixed(2)}</span>
            </li>
            <li className="flex justify-between p-2 bg-gray-50 rounded border border-gray-100">
                <span>Level 5</span> <span className="font-bold text-gray-800">${rates.level5.toFixed(2)}</span>
            </li>
          </ul>
          <p className="text-xs text-gray-400 mt-4 text-center">Commission is credited instantly when a downline task is approved.</p>
        </div>
        
        {/* Network Tree */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 text-xl">My Network Team</h3>
            
            {network.map((gen) => (
                <div key={gen.level} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700 text-sm">Generation {gen.level}</span>
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{gen.users.length} Members</span>
                    </div>
                    
                    <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                        {gen.users.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No members in this level yet.</div>
                        ) : (
                            gen.users.map(u => (
                                <div key={u.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {u.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{u.fullName}</p>
                                            <p className="text-xs text-gray-500">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {u.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
