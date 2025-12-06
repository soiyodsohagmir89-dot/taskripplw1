
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { getTasks, getSubmissions, getTransactions } from '../../../services/mockBackend';
import { Task, TransactionType, TransactionStatus } from '../../../types';
import { Megaphone, CheckCircle, Clock, XCircle, PlusCircle, DollarSign, BarChart2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const AdvertiserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeAds: 0,
    totalSpent: 0,
    pendingAds: 0,
    rejectedAds: 0
  });

  useEffect(() => {
    if (!user) return;
    const allTasks = getTasks();
    const myTasks = allTasks.filter(t => t.creatorId === user.id);
    
    // Calculate total spent from transactions
    const txs = getTransactions();
    const spent = txs
        .filter(t => t.userId === user.id && t.type === TransactionType.AD_SPEND)
        .reduce((acc, curr) => acc + curr.amount, 0);

    setStats({
      activeAds: myTasks.filter(t => t.status === 'APPROVED').length,
      pendingAds: myTasks.filter(t => t.status === 'PENDING').length,
      rejectedAds: myTasks.filter(t => t.status === 'REJECTED').length,
      totalSpent: spent
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
       {/* Welcome Banner */}
       <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
             <h1 className="text-3xl font-bold mb-2">Advertiser Dashboard</h1>
             <p className="text-purple-200">Manage your campaigns, orders, and grow your business.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[200px] text-center">
             <p className="text-xs uppercase font-bold tracking-wider text-purple-300 mb-1">Advertiser Balance</p>
             <p className="text-3xl font-extrabold text-white">${(user.advertiserBalance || 0).toFixed(3)}</p>
             <Link to="/advertiser/deposit" className="inline-block mt-2 text-xs font-bold text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600">
                + Add Funds
             </Link>
          </div>
       </div>

       {/* Quick Actions */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/advertiser/create-job" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                <PlusCircle size={28} />
             </div>
             <div>
                <h3 className="font-bold text-gray-900">Create New Job</h3>
                <p className="text-xs text-gray-500">Post a task for workers</p>
             </div>
          </Link>
          <Link to="/advertiser/my-ads" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="bg-purple-100 text-purple-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                <BarChart2 size={28} />
             </div>
             <div>
                <h3 className="font-bold text-gray-900">My Campaigns</h3>
                <p className="text-xs text-gray-500">Track performance & stats</p>
             </div>
          </Link>
          <Link to="/advertiser/deposit" className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all flex items-center gap-4 group">
             <div className="bg-green-100 text-green-600 p-3 rounded-full group-hover:scale-110 transition-transform">
                <DollarSign size={28} />
             </div>
             <div>
                <h3 className="font-bold text-gray-900">Deposit Funds</h3>
                <p className="text-xs text-gray-500">Transfer or Deposit</p>
             </div>
          </Link>
       </div>

       {/* Stats Grid */}
       <h3 className="text-xl font-bold text-gray-900">Overview</h3>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-green-600">
                <CheckCircle size={18} />
                <span className="text-xs font-bold uppercase">Active Ads</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">{stats.activeAds}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-yellow-600">
                <Clock size={18} />
                <span className="text-xs font-bold uppercase">Pending Ads</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">{stats.pendingAds}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-red-600">
                <XCircle size={18} />
                <span className="text-xs font-bold uppercase">Rejected Ads</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">{stats.rejectedAds}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex items-center gap-2 mb-2 text-indigo-600">
                <DollarSign size={18} />
                <span className="text-xs font-bold uppercase">Total Spent</span>
             </div>
             <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
          </div>
       </div>
    </div>
  );
};
