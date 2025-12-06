
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, getTransactions, getTasks } from '../../services/mockBackend';
import { Users, DollarSign, Activity, Copy, Share2, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingDeposits: 0,
    totalPaidOut: 0,
    pendingJobs: 0
  });

  useEffect(() => {
    const users = getUsers();
    const txs = getTransactions();
    const tasks = getTasks();
    
    setStats({
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'ACTIVE').length,
      pendingDeposits: txs.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
      totalPaidOut: txs
        .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
        .reduce((acc, curr) => acc + curr.amount, 0),
      pendingJobs: tasks.filter(t => t.status === 'PENDING').length
    });
  }, []);

  const cards = [
    { title: 'Pending Jobs', val: stats.pendingJobs, icon: AlertCircle, color: 'bg-orange-500', alert: stats.pendingJobs > 0 },
    { title: 'Total Users', val: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Users', val: stats.activeUsers, icon: Activity, color: 'bg-green-500' },
    { title: 'Pending Deposits', val: stats.pendingDeposits, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border ${c.alert ? 'border-orange-300 ring-4 ring-orange-50' : 'border-gray-200'} flex items-center gap-4 transition-all`}>
            <div className={`p-3 rounded-lg ${c.color} text-white`}>
              <c.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{c.val}</h3>
              {c.alert && <span className="text-xs text-orange-600 font-bold animate-pulse">Action Required</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Referral Section */}
      {user && (
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Share2 size={120} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Share2 className="w-6 h-6" /> Admin Referral Center
            </h3>
            <p className="text-indigo-200 mb-6 max-w-xl">
              Share your unique admin referral code. Users who sign up with this code will be directly attributed to your network top-level.
            </p>

            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 min-w-[300px]">
                <div>
                  <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-1">My Referral Code</p>
                  <p className="text-3xl font-mono font-bold tracking-wide">{user.referralCode}</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(user.referralCode)}
                  className="ml-auto p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
                  title="Copy Code"
                >
                  <Copy className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4 flex-1">
                 <div className="flex-1 min-w-0">
                  <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-1">Referral Link</p>
                  <p className="text-sm font-mono truncate text-indigo-100">
                    {`${window.location.origin}/#/register?ref=${user.referralCode}`}
                  </p>
                </div>
                <button 
                  onClick={() => copyToClipboard(`${window.location.origin}/#/register?ref=${user.referralCode}`)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
                  title="Copy Link"
                >
                  <Copy className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
