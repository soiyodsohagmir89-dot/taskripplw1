import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { submitActivationPayment, getPaymentSettings } from '../../services/mockBackend';
import { AccountStatus, PaymentSettings } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Copy, Upload, X, Image as ImageIcon, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Activation: React.FC = () => {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  
  const [method, setMethod] = useState('Bkash');
  const [sender, setSender] = useState('');
  const [trxId, setTrxId] = useState('');
  const [proofUrl, setProofUrl] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
        alert("Please upload proof screenshot.");
        return;
    }
    
    setIsSubmitting(true);
    try {
      // Pass the user ID and payment data
      // Expect updated user object in response
      const updatedUser = await submitActivationPayment(user.id, {
          method,
          sender,
          trxId,
          proofUrl
      });
      
      // Update the AuthContext user object immediately with new status
      setUser(updatedUser);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Active
  if (user.status === AccountStatus.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-green-100 p-4 rounded-full mb-4 animate-in zoom-in">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Account Active</h2>
        <p className="text-gray-600 mt-2 max-w-md">You are fully verified and can start earning!</p>
        <div className="mt-6">
            <Link to="/dashboard">
                <Button className="flex items-center gap-2">
                    <LayoutDashboard size={18} /> Go to Dashboard
                </Button>
            </Link>
        </div>
      </div>
    );
  }

  // State 2: Under Review (Strictly check user.status)
  if (user.status === AccountStatus.REVIEW) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center bg-white rounded-xl border border-gray-200 p-8">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Submitted</h2>
        <p className="text-gray-600 mt-2 font-medium">Activation is under review.</p>
        <p className="text-gray-500 text-sm mt-1 max-w-sm">Please wait while our admin verifies your transaction. This page will update automatically once approved.</p>
      </div>
    );
  }

  const selectedNumber = method === 'Bkash' ? settings.bkash : 
                         method === 'Nagad' ? settings.nagad :
                         method === 'Rocket' ? settings.rocket : settings.binance;

  const feeAmount = settings.activationFee || 25; // Default fallback to 25
  const feeInBdt = feeAmount * settings.rate;

  // State 3: Payment Form (Only if status is PENDING)
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Activate Your Account</h2>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mb-8">
          <p className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Payment Instructions</p>
          <p className="text-gray-700 mb-4">
            Please send exactly <strong className="text-gray-900">${feeAmount} USD</strong> (approx. <span className="text-indigo-700 font-bold">{feeInBdt} BDT</span>) to activate your account.
          </p>
          
          {/* Method Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
             {['Bkash', 'Nagad', 'Rocket', 'Binance'].map(m => (
                <button 
                  key={m}
                  type="button" 
                  onClick={() => setMethod(m)}
                  className={`py-2 px-3 rounded border text-sm font-medium transition-all ${method === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {m}
                </button>
             ))}
          </div>

          <div className="flex flex-col items-center gap-2 bg-white p-4 rounded border border-indigo-200 text-center">
            <span className="text-xs text-gray-500 font-bold uppercase">Send Payment To</span>
            <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-gray-900 break-all">{selectedNumber}</span>
                <button className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-indigo-50 rounded" onClick={() => navigator.clipboard.writeText(selectedNumber)}>
                    <Copy size={16} />
                </button>
            </div>
            <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">Method: {method}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number / ID</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder={method === 'Binance' ? 'Your Binance ID' : '017...'}
                  value={sender}
                  onChange={e => setSender(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="TrxID..."
                  value={trxId}
                  onChange={e => setTrxId(e.target.value)}
                />
              </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proof Screenshot</label>
            {!proofUrl ? (
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
                    <p className="text-sm font-medium text-gray-900">Upload Payment Screenshot</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
            ) : (
                <div className="relative border border-gray-200 rounded-lg p-2 bg-gray-50">
                    <img 
                      src={proofUrl} 
                      alt="Payment Proof" 
                      className="w-full h-48 object-contain rounded-md bg-white border border-gray-100" 
                    />
                    <button
                      type="button"
                      onClick={() => setProofUrl('')}
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

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Payment for Review'}
          </Button>
        </form>
      </div>
    </div>
  );
};