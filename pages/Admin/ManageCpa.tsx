
import React, { useState, useEffect } from 'react';
import { getCpaCampaigns, approveCpaCampaign, rejectCpaCampaign, getConversionLogs, getClickLogs } from '../../services/mockBackend';
import { CpaCampaign } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, BarChart2, PauseCircle } from 'lucide-react';

export const ManageCpa: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CpaCampaign[]>([]);
  
  // Analytics
  const [stats, setStats] = useState({ clicks: 0, conversions: 0 });

  const loadData = () => {
    setCampaigns(getCpaCampaigns());
    setStats({
        clicks: getClickLogs().length,
        conversions: getConversionLogs().length
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (id: string) => {
      approveCpaCampaign(id);
      loadData();
  };

  const handleReject = (id: string) => {
      if(window.confirm("Reject this campaign?")) {
          rejectCpaCampaign(id);
          loadData();
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Manage CPA Campaigns</h2>
            <div className="flex gap-4 text-sm font-medium">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">Total Clicks: {stats.clicks}</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded">Total Conversions: {stats.conversions}</span>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-800 text-gray-200">
                    <tr>
                        <th className="px-6 py-3">Campaign</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Budget / Spend</th>
                        <th className="px-6 py-3">Payout</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {campaigns.length === 0 ? <tr><td colSpan={6} className="p-8 text-center">No campaigns</td></tr> : 
                    campaigns.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">{c.title}</p>
                                <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{c.targetUrl}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{c.type}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(c.spent / c.budget) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500">${c.spent.toFixed(2)} / ${c.budget.toFixed(2)}</p>
                            </td>
                            <td className="px-6 py-4 font-bold text-green-600">${c.payoutPerAction}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                {c.status === 'PENDING' && (
                                    <>
                                        <Button size="sm" onClick={() => handleApprove(c.id)} className="bg-green-600"><Check size={16}/></Button>
                                        <Button size="sm" variant="danger" onClick={() => handleReject(c.id)}><X size={16}/></Button>
                                    </>
                                )}
                                {c.status === 'ACTIVE' && (
                                    <Button size="sm" variant="danger" onClick={() => handleReject(c.id)} title="Pause/Reject"><PauseCircle size={16}/></Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
