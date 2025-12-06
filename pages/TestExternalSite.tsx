
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { triggerPixelConversion } from '../services/mockBackend';
import { Loader2, CheckCircle, AlertTriangle, Clock, UserPlus, Eye } from 'lucide-react';

export const TestExternalSite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clickId = searchParams.get('click_id');
  const targetUrl = searchParams.get('target');
  const timerParam = searchParams.get('timer');
  const typeParam = searchParams.get('type') || 'SIGNUP_SIMPLE'; // ADS_VIEW or SIGNUP_...
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [msg, setMsg] = useState('');
  
  // Timer Logic (Used primarily for ADS_VIEW)
  const requiredSeconds = timerParam ? parseInt(timerParam) : 15;
  const [timeLeft, setTimeLeft] = useState(requiredSeconds);

  const isAdsView = typeParam === 'ADS_VIEW';

  useEffect(() => {
    // Only run timer if it's ADS_VIEW
    if (isAdsView && timeLeft > 0 && status === 'IDLE') {
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [timeLeft, status, isAdsView]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickId) {
        alert("No tracking ID found. Conversion will fail.");
        return;
    }

    setLoading(true);
    try {
        // Simulate network delay for verification
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // --- KEY LOGIC: TRIGGER REWARD ---
        // In a real scenario, this happens via Server-to-Server Postback.
        // Here we simulate the external site notifying our backend.
        triggerPixelConversion(clickId);
        
        setStatus('SUCCESS');
    } catch (err: any) {
        setStatus('ERROR');
        setMsg(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
        <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 relative overflow-hidden">
            
            {/* Timer Overlay for ADS_VIEW */}
            {isAdsView && timeLeft > 0 && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-4 py-2 rounded-bl-xl font-mono font-bold flex items-center gap-2 shadow-md z-10">
                    <Clock size={16} className="animate-pulse" /> 
                    Wait: {timeLeft}s
                </div>
            )}

            {/* Simulated Header */}
            <div className="border-b pb-6 mb-6 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {isAdsView ? 'Partner Website' : 'Partner Registration'}
                </p>
                <h1 className="text-3xl font-extrabold text-gray-900">
                    {isAdsView ? 'Premium Content' : 'Join Our Platform'}
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    {isAdsView ? 'View this content to earn rewards.' : 'Complete registration to claim your bonus.'}
                </p>
                <div className="mt-2 text-xs text-gray-300 font-mono break-all px-4">
                    Target: {targetUrl || 'https://partner-site.com'}
                </div>
            </div>

            {/* Success State */}
            {status === 'SUCCESS' ? (
                <div className="text-center py-8 animate-in zoom-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isAdsView ? 'View Completed!' : 'Registration Successful!'}
                    </h2>
                    <p className="text-gray-600">
                        The reward has been credited to your TaskRipple wallet.
                    </p>
                    <p className="text-sm text-gray-400 mt-6">You can close this tab now.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Instructions */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} /> Requirements
                        </h3>
                        <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                            {isAdsView ? (
                                <>
                                    <li>Stay on this page for at least <strong>{requiredSeconds} seconds</strong>.</li>
                                    <li>Do not close the tab until the timer finishes.</li>
                                </>
                            ) : (
                                <>
                                    <li>Fill out the registration form below with <strong>valid details</strong>.</li>
                                    <li>Click "Create Account" to verify your signup.</li>
                                    <li>Fake info may lead to a ban on TaskRipple.</li>
                                </>
                            )}
                        </ul>
                    </div>

                    {status === 'ERROR' && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-2 border border-red-100">
                            <AlertTriangle size={20} /> {msg}
                        </div>
                    )}

                    {/* Action Area */}
                    <form onSubmit={handleAction} className="space-y-4">
                        {!isAdsView && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <input required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="First Name" />
                                    <input required className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Last Name" />
                                </div>
                                <input required type="email" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email Address" />
                                <input required type="password" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Create Password" />
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading || (isAdsView && timeLeft > 0)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="animate-spin" /> Verifying...</>
                            ) : isAdsView ? (
                                timeLeft > 0 ? `Wait ${timeLeft}s to Claim` : <><Eye size={20} /> Claim Reward</>
                            ) : (
                                <><UserPlus size={20} /> Create Account & Earn</>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};
