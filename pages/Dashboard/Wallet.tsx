
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestWithdrawal } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle, Wallet as WalletIcon } from 'lucide-react';

const WITHDRAWAL_METHODS = ['Bkash', 'Nagad', 'Rocket', 'Binance'];

export const Wallet: React.FC = () => {
  const { user, setUser } = useAuth();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState('Bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  if (!user) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (amount < 5) return setError('Minimum withdrawal is $5.00');
    if (amount > user.balance) return setError('Insufficient funds in wallet');
    if (!accountNumber) return setError('Please enter a valid account number/ID');

    try {
      // Pass generic method and account number
      await requestWithdrawal(user.id, amount, method, accountNumber);
      setSuccess('Withdrawal request submitted successfully!');
      setAmount(0);
      setAccountNumber('');
    } catch (err: any) {
      setError(err.message || 'Failed to request withdrawal');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
            <p className="text-indigo-100 font-medium mb-1">Total Withdrawable Balance</p>
            <h1 className="text-5xl font-bold">${user.balance.toFixed(2)}</h1>
        </div>
        <div className="bg-white/20 p-4 rounded-full">
            <WalletIcon size={48} className="text-white" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-gray-900">Request Withdrawal</h3>
        
        {success && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
                <CheckCircle size={20} />
                {success}
            </div>
        )}

        {error && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
            </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-2">
                    {WITHDRAWAL_METHODS.map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m)}
                            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                                method === m 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  min="5" 
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value))}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1 font-medium">Minimum withdrawal: $5.00</p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                {method === 'Binance' ? 'Account Number' : `${method} Account Number`}
            </label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder={method === 'Binance' ? 'Enter Binance ID / Pay ID' : '017...'}
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={amount < 5 || !accountNumber || amount > user.balance}>
              Submit Withdrawal Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
