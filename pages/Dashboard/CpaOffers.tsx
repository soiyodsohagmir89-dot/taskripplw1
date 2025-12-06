
import React, { useState, useEffect } from 'react';
import { getCpaCampaigns, trackClick, getConversionLogs } from '../../services/mockBackend';
import { CpaCampaign, AccountStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ExternalLink, MapPin, DollarSign, MousePointerClick, CheckCircle, Clock } from 'lucide-react';

export const CpaOffers: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CpaCampaign[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Filter: Active campaigns only
      const all = getCpaCampaigns().filter(c => c.status === 'ACTIVE');
      setCampaigns(all);
      setConversions(getConversionLogs().filter(c => c.workerId === user.id));
    }
  }, [user]);

  if (!user) return null;

  if (user.status !== AccountStatus.ACTIVE) {
    return <div className="p-8 text-center text-gray-500">You must be verified to access these offers.</div>;
  }

  const handleStart = (campaign: CpaCampaign) => {
    // 1. Check Geo (Simulation)
    const userCountry = 'International'; // Assuming user is intl for mock
    if (!campaign.targetCountries.includes('International') && !campaign.targetCountries.includes('Bangladesh')) {
       alert('This offer is not available in your country.');
       return;
    }

    // 2. Generate Tracking ID
    const clickId = trackClick(campaign.id, user.id);

    // 3. Redirect to External Site (Simulated via internal route)
    // We pass the 'timer' and 'type' params to simulate the specific requirements on the external page
    const timer = campaign.minSeconds || 15;
    const url = `#/external-test-site?click_id=${clickId}&target=${encodeURIComponent(campaign.targetUrl)}&timer=${timer}&type=${campaign.type}`;
    window.open(url, '_blank');
  };

  const isConverted = (campaignId: string) => {
      return conversions.some(c => c.campaignId === campaignId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <MousePointerClick className="text-indigo-600" /> Ads & Sign-Up Offers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c, idx) => {
            const completed = isConverted(c.id);
            return (
                <div key={c.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${completed ? 'opacity-75' : ''}`}>
                    <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                                #{idx + 1}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${c.type.includes('SIGNUP') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.type === 'ADS_VIEW' ? 'Ads View' : 'Sign Up'}
                            </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{c.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-4">{c.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {c.targetCountries.join(', ')}</span>
                            {c.type === 'ADS_VIEW' && c.minSeconds && (
                                <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded">
                                    <Clock size={12} /> {c.minSeconds}s
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-green-600 font-bold text-xl">
                            ${c.payoutPerAction.toFixed(3)}
                        </div>
                        
                        {completed ? (
                            <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                                <CheckCircle size={16} /> Completed
                            </span>
                        ) : (
                            <Button onClick={() => handleStart(c)} size="sm" className="flex items-center gap-1">
                                Start Offer <ExternalLink size={14} />
                            </Button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
      
      {campaigns.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No offers available at the moment.</p>
          </div>
      )}
    </div>
  );
};
