import React, { useEffect, useState } from 'react';
import { getTransactions, approveActivation, rejectActivation, approveAdvertiserDeposit, rejectAdvertiserDeposit, getUserName } from '../../services/mockBackend';
import { Transaction, TransactionType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, ExternalLink, Search, RefreshCw, AlertCircle, Eye } from 'lucide-react';

export const ManageDeposits: React.FC = () => {
  const [activations, setActivations] = useState<Transaction[]>([]);
  const [adDeposits, setAdDeposits] = useState<Transaction[]>([]);
  
  const [activeTab, setActiveTab] = useState<'ACTIVATIONS' | 'ADVERTISER'>('ACTIVATIONS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for Image Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setTimeout(() => {
        // Fetch fresh transactions
        const allTxs = getTransactions();
        
        // Filter for PENDING transactions only
        const pendingTxs = allTxs.filter(t => t.status === 'PENDING');
        
        // Split into Activation Fees vs Advertiser Deposits
        setActivations(pendingTxs.filter(t => t.type === 'DEPOSIT'));
        setAdDeposits(pendingTxs.filter(t => t.type === 'ADVERTISER_DEPOSIT'));
        
        setIsLoading(false);
    }, 300); // Small delay for visual feedback
  };

  useEffect(() => {
    load();
    // Auto-refresh every 10 seconds to catch new submissions
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  // Activation Actions
  const handleApproveAct = async (id: string) => { 
      try { 
          await approveActivation(id); 
          load(); 
      } catch (e) { 
          alert('Error approving'); 
      } 
  };
  const handleRejectAct = async (id: string) => { 
      await rejectActivation(id); 
      load(); 
  };

  // Advertiser Actions
  const handleApproveAd = async (id: string) => { 
      try { 
          await approveAdvertiserDeposit(id); 
          load(); 
      } catch (e) { 
          alert('Error approving'); 
      } 
  };
  const handleRejectAd = async (id: string) => { 
      await rejectAdvertiserDeposit(id); 
      load(); 
  };

  // Filtering Logic
  const filterTransactions = (txs: Transaction[]) => {
    return txs.filter(tx => {
       const uName = getUserName(tx.userId).toLowerCase();
       const uId = tx.userId.toLowerCase();
       const term = searchTerm.toLowerCase();
       const amt = tx.amount.toString();
       return uName.includes(term) || uId.includes(term) || amt.includes(term);
    });
  };

  const getActiveList = () => {
      if(activeTab === 'ACTIVATIONS') return filteredActivations;
      return filteredAdDeposits;
  };

  const filteredActivations = filterTransactions(activations);
  const filteredAdDeposits = filterTransactions(adDeposits);

  const renderActionButtons = (id: string) => {
      if (activeTab === 'ACTIVATIONS') {
          return <><Button size="sm" onClick={() => handleApproveAct(id)} className="bg-green-600 hover:bg-green-700" title="Approve Activation"><Check size={16} /></Button><Button size="sm" variant="danger" onClick={() => handleRejectAct(id)} title="Reject"><X size={16} /></Button></>;
      } else {
          return <><Button size="sm" onClick={() => handleApproveAd(id)} className="bg-green-600 hover:bg-green-700" title="Approve Ad Funds"><Check size={16} /></Button><Button size="sm" variant="danger" onClick={() => handleRejectAd(id)} title="Reject"><X size={16} /></Button></>;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Finances</h2>
            <p className="text-gray-500 text-sm mt-1">Review pending activations and deposits.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Search UID, Name, Amount..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" onClick={load} className="shrink-0" title="Refresh List">
                <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            </Button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-200 rounded-lg w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('ACTIVATIONS')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'ACTIVATIONS' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>
           Activations
           {activations.length > 0 && <span className="bg-blue-50 text-[#0066FF] border border-[#0066FF] text-xs px-2 py-0.5 rounded-full">{activations.length}</span>}
        </button>
        <button onClick={() => setActiveTab('ADVERTISER')} className={`px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === 'ADVERTISER' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}>
           Ad Deposits
           {adDeposits.length > 0 && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{adDeposits.length}</span>}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                <tr>
                <th className="px-6 py-4 font-semibold">User Details</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Transaction Info</th>
                <th className="px-6 py-4 font-semibold">Proof</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {getActiveList().length === 0 ? (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle className="w-8 h-8 text-gray-300" />
                                <p>No pending transactions found.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    getActiveList().map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{getUserName(tx.userId)}</div>
                            <div className="text-xs font-mono text-gray-500">{tx.userId}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-green-600 text-lg">${tx.amount}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                            <div className="grid gap-1">
                                <span className="flex gap-1"><span className="text-gray-500">Method:</span> <span className="font-bold text-indigo-600">{tx.metadata?.paymentMethod}</span></span>
                                <span className="flex gap-1"><span className="text-gray-500">Sender:</span> <span className="font-mono text-gray-900">{tx.metadata?.senderNumber}</span></span>
                                <span className="flex gap-1"><span className="text-gray-500">TrxID:</span> <span className="font-mono bg-gray-100 px-1 rounded text-gray-800">{tx.metadata?.trxId}</span></span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {tx.metadata?.proofUrl ? (
                                <button 
                                    onClick={() => setSelectedImage(tx.metadata?.proofUrl || null)}
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 font-medium text-xs transition-colors"
                                >
                                    <Eye size={14}/> View Screenshot
                                </button>
                            ) : <span className="text-gray-400 text-xs">No Proof</span>}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                                {renderActionButtons(tx.id)}
                            </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                 <button 
                    className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                    onClick={() => setSelectedImage(null)}
                    title="Close Preview"
                 >
                    <X size={32} />
                 </button>
                 
                 <img 
                    src={selectedImage} 
                    alt="Payment Proof" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-800"
                    onClick={(e) => e.stopPropagation()} 
                 />
            </div>
        </div>
      )}
    </div>
  );
};