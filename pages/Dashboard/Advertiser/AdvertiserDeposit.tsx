
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { depositToAdvertiser, transferWorkerToAdvertiser, getPaymentSettings, getUsers } from '../../../services/mockBackend';
import { Button } from '../../../components/ui/Button';
import { ArrowRightLeft, CreditCard, Copy, Info, Upload, X, CheckCircle } from 'lucide-react';
import { PaymentSettings } from '../../../types';

export const AdvertiserDeposit: React.FC = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'GATEWAY' | 'TRANSFER'>('GATEWAY');
  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  // Gateway Form
  const [amount, setAmount] = useState<number>(2);
  const [method, setMethod] = useState('Bkash');
  const [sender, setSender] = useState('');
  const [trxId, setTrxId] = useState('');
  const [proof, setProof] = useState('');
  const [message, setMessage] = useState('');

  // Transfer Form
  const [transferAmount, setTransferAmount] = useState<number>(0);

  useEffect(() => {
    setSettings(getPaymentSettings());
  }, []);

  if (!user || !settings) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) {
        alert("Please upload proof screenshot.");
        return;
    }
    try {
      await depositToAdvertiser(user.id, amount, method, sender, trxId, proof);
      setMessage('Deposit request submitted! Admin will approve shortly.');
      setAmount(2);
      setSender('');
      setTrxId('');
      setProof('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await transferWorkerToAdvertiser(user.id, transferAmount);
      setUser(updatedUser);
      setMessage(`Successfully transferred $${transferAmount} to Advertiser Balance.`);
      setTransferAmount(0);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const selectedNumber = method === 'Bkash' ? settings.bkash : 
                         method === 'Nagad' ? settings.nagad :
                         method === 'Rocket' ? settings.rocket : settings.binance;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Add Funds</h2>
      
      <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
        <button 
           onClick={() => setActiveTab('GATEWAY')}
           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'GATEWAY' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
           Deposit (Bkash/Nagad/Binance)
        </button>
        <button 
           onClick={() => setActiveTab('TRANSFER')}
           className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'TRANSFER' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
           Transfer from Earning
        </button>
      </div>

      {message && <div className="bg-green-50 text-green-700 p-4 rounded-lg">{message}</div>}

      {activeTab === 'GATEWAY' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
              <p className="text-sm text-yellow-800 font-bold mb-1">Exchange Rate</p>
              <p className="text-lg font-bold text-gray-900">$1.00 = {settings.rate} Taka</p>
              <p className="text-xs text-gray-500 mt-1">Minimum Deposit: $2.00 ({2 * settings.rate} Taka)</p>
           </div>

           <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Method</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   {['Bkash', 'Nagad', 'Rocket', 'Binance'].map(m => (
                      <button 
                        key={m}
                        type="button" 
                        onClick={() => setMethod(m)}
                        className={`py-2 px-3 rounded border text-sm font-medium ${method === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                      >
                        {m}
                      </button>
                   ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border border-gray-200 flex flex-col items-center text-center">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Send Payment To</p>
                 <p className="text-xl font-mono font-bold text-indigo-700 break-all">{selectedNumber}</p>
                 <button type="button" onClick={() => navigator.clipboard.writeText(selectedNumber)} className="text-xs text-indigo-500 mt-2 hover:underline">
                    Copy Number
                 </button>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">Amount (USD)</label>
                 <input 
                    type="number" 
                    min="2"
                    step="0.1"
                    className="w-full border rounded px-3 py-2"
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value))}
                    required
                 />
                 <p className="text-xs text-gray-500 mt-1">You must send: <span className="font-bold text-gray-900">{(amount * settings.rate).toFixed(2)} BDT</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sender Number</label>
                    <input 
                        type="text" 
                        className="w-full border rounded px-3 py-2"
                        value={sender}
                        onChange={e => setSender(e.target.value)}
                        required
                        placeholder="017..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Transaction ID</label>
                    <input 
                        type="text" 
                        className="w-full border rounded px-3 py-2"
                        value={trxId}
                        onChange={e => setTrxId(e.target.value)}
                        required
                        placeholder="TRX123..."
                    />
                  </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Proof Screenshot</label>
                 {!proof ? (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        required
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-900">Upload Transaction Screenshot</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                 ) : (
                    <div className="relative border border-gray-200 rounded-lg p-2 bg-gray-50">
                        <img 
                          src={proof} 
                          alt="Proof Preview" 
                          className="w-full h-48 object-contain rounded-md bg-white border border-gray-100" 
                        />
                        <button
                          type="button"
                          onClick={() => setProof('')}
                          className="absolute top-3 right-3 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-gray-200 hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                        <div className="flex items-center gap-2 mt-2 px-1 text-xs text-green-600 font-bold">
                          <CheckCircle size={14} className="text-green-600" /> Image Selected
                        </div>
                    </div>
                 )}
              </div>

              <Button type="submit" className="w-full py-3">Submit Deposit Request</Button>
           </form>
        </div>
      )}

      {activeTab === 'TRANSFER' && (
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
               <div>
                 <p className="text-xs uppercase text-gray-500 font-bold">Worker Wallet</p>
                 <p className="text-xl font-bold">${user.balance.toFixed(3)}</p>
               </div>
               <ArrowRightLeft className="text-gray-400" />
               <div className="text-right">
                 <p className="text-xs uppercase text-gray-500 font-bold">Advertiser Wallet</p>
                 <p className="text-xl font-bold">${(user.advertiserBalance || 0).toFixed(3)}</p>
               </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Transfer Amount ($)</label>
                  <input 
                     type="number"
                     step="0.001"
                     min="0.1"
                     max={user.balance}
                     className="w-full border rounded px-3 py-2 text-lg"
                     value={transferAmount}
                     onChange={e => setTransferAmount(parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Available to transfer: ${user.balance.toFixed(3)}</p>
               </div>
               <Button type="submit" className="w-full py-3" disabled={transferAmount <= 0 || transferAmount > user.balance}>
                 Transfer Now
               </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100 flex gap-2">
               <Info size={16} className="shrink-0 mt-0.5" />
               <p>Funds transferred to Advertiser Balance cannot be withdrawn or moved back to Worker Balance.</p>
            </div>
         </div>
      )}
    </div>
  );
};
