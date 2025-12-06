
import React, { useEffect, useState } from 'react';
import { getTransactions, getUsers, approveWithdrawal, rejectWithdrawal, getUserName } from '../../services/mockBackend';
import { Transaction, TransactionType, TransactionStatus, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, AlertCircle, Search } from 'lucide-react';

export const ManageWithdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    const allTxs = getTransactions();
    const w = allTxs.filter(t => t.type === TransactionType.WITHDRAWAL);
    // Sort pending first, then by date desc
    w.sort((a, b) => {
        if (a.status === TransactionStatus.PENDING && b.status !== TransactionStatus.PENDING) return -1;
        if (a.status !== TransactionStatus.PENDING && b.status === TransactionStatus.PENDING) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setWithdrawals(w);
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserBalance = (userId: string) => {
    const u = users.find(user => user.id === userId);
    return u ? u.balance : 0;
  };

  const handleApprove = async (id: string) => {
    setError('');
    try {
      await approveWithdrawal(id);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: string) => {
    setError('');
    try {
      await rejectWithdrawal(id);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to reject withdrawal');
    }
  };

  const filteredWithdrawals = withdrawals.filter(tx => {
     const uName = getUserName(tx.userId).toLowerCase();
     const uId = tx.userId.toLowerCase();
     // Search in new generic metadata fields or fallback to binanceId
     const accInfo = (tx.metadata?.accountNumber || tx.metadata?.binanceId || '').toLowerCase();
     const method = (tx.metadata?.paymentMethod || '').toLowerCase();
     const term = searchTerm.toLowerCase();

     return uName.includes(term) || uId.includes(term) || accInfo.includes(term) || method.includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Withdrawals</h2>
        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
                type="text"
                placeholder="Search UID, Name, Wallet..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">UID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Account No.</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredWithdrawals.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-500">No withdrawal requests found.</td></tr>
                    ) : (
                        filteredWithdrawals.map(tx => {
                            const currentBalance = getUserBalance(tx.userId);
                            const isPending = tx.status === TransactionStatus.PENDING;
                            // Check available balance vs withdrawal amount (important for approvals)
                            // If pending, funds are still in user wallet until approved/rejected.
                            const sufficientFunds = currentBalance >= tx.amount;

                            return (
                                <tr key={tx.id} className={!isPending ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{getUserName(tx.userId)}</div>
                                        <div className="text-xs text-gray-500">Bal: ${currentBalance.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {tx.userId}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ${tx.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                                            {tx.metadata?.paymentMethod || 'Binance (Legacy)'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                                        {tx.metadata?.accountNumber || tx.metadata?.binanceId || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            tx.status === TransactionStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                            tx.status === TransactionStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isPending && (
                                            <div className="flex items-center justify-end gap-2">
                                                {!sufficientFunds && (
                                                    <span className="text-xs text-red-500 mr-2 font-bold">Insuff. Funds</span>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleApprove(tx.id)} 
                                                    className="bg-green-600 hover:bg-green-700"
                                                    disabled={!sufficientFunds}
                                                    title={!sufficientFunds ? "User has insufficient funds" : "Approve"}
                                                >
                                                    <Check size={16} />
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleReject(tx.id)}>
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
