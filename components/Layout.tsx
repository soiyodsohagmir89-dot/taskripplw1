





import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './ui/Avatar';
import { getPendingTasksCount } from '../services/mockBackend';
import { 
  LayoutDashboard, CheckSquare, Wallet, Users, LogOut, Menu, X, ShieldCheck, DollarSign, ClipboardList, UserCog, Banknote, Briefcase, FileText, MousePointerClick, PlusCircle, BarChart2, Settings, ArrowRightLeft, FolderTree, Video, PlaySquare, Key, FolderHeart, ListPlus,
  Bell, Mail, Send, Trophy
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, viewMode, toggleViewMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        setPendingCount(getPendingTasksCount());
    }, 5000);
    setPendingCount(getPendingTasksCount());
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const NavItem = ({ to, icon: Icon, label, badge }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
            : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
        <span className="font-medium">{label}</span>
        {badge > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            TaskRipple
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {isAdmin ? (
            <>
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-2">Admin Panel</div>
              <NavItem to="/admin" icon={LayoutDashboard} label="Overview" />
              <NavItem to="/admin/broadcast" icon={Bell} label="Send Notification" />
              <NavItem to="/admin/inbox" icon={Mail} label="Inbox" />
              <NavItem to="/admin/giveaway" icon={Trophy} label="Giveaway" />
              
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Management</div>
              <NavItem to="/admin/deposits" icon={Banknote} label="Manage Deposits" />
              <NavItem to="/admin/withdrawals" icon={DollarSign} label="Withdrawals" />
              <NavItem to="/admin/approvals" icon={CheckSquare} label="Task Approvals" />
              <NavItem to="/admin/tasks" icon={ClipboardList} label="Manage Jobs" badge={pendingCount} />
              <NavItem to="/admin/categories" icon={FolderTree} label="Manage Categories" />
              <NavItem to="/admin/users" icon={UserCog} label="Users" />
              <NavItem to="/admin/official-requests" icon={Briefcase} label="HP Job Users" />
              <NavItem to="/admin/hp-jobs" icon={ListPlus} label="Manage HP Jobs" />
              <NavItem to="/admin/official-jobs" icon={FileText} label="HP Job Submissions" />
              <NavItem to="/admin/secret-codes" icon={Key} label="Secret Codes" />
              <NavItem to="/admin/manage-cpa" icon={MousePointerClick} label="CPA Campaigns" />
              <NavItem to="/admin/manage-content" icon={Video} label="Moderate Content" />
              <NavItem to="/admin/settings" icon={Settings} label="Settings" />
            </>
          ) : viewMode === 'WORKER' ? (
            <>
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Earning</div>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/tasks" icon={CheckSquare} label="Available Tasks" />
              <NavItem to="/giveaway" icon={Trophy} label="Giveaway Task" />
              <NavItem to="/cpa-offers" icon={MousePointerClick} label="Ads & Offers" />
              <NavItem to="/official-job" icon={Briefcase} label="High Paying Job" />
              
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Communication</div>
              <NavItem to="/notifications" icon={Bell} label="Notifications" />
              <NavItem to="/support" icon={Send} label="Contact Admin" />

              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Finance</div>
              <NavItem to="/wallet" icon={Wallet} label="My Wallet" />
              <NavItem to="/referrals" icon={Users} label="Refer & Earn" />

              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Resources</div>
              <NavItem to="/free-resources" icon={FolderHeart} label="Free Digital Resources" />

              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6">Social</div>
              <NavItem to="/feed" icon={PlaySquare} label="Social Feed" />
              <NavItem to="/create-post" icon={PlusCircle} label="Post Content" />
            </>
          ) : (
            <>
              <div className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-purple-600">Advertiser Panel</div>
              <NavItem to="/advertiser" icon={LayoutDashboard} label="Overview" />
              <NavItem to="/advertiser/create-job" icon={PlusCircle} label="Create Job" />
              <NavItem to="/advertiser/create-cpa" icon={MousePointerClick} label="Create CPA Offer" />
              <NavItem to="/advertiser/my-ads" icon={BarChart2} label="My Campaigns" />
              <NavItem to="/advertiser/deposit" icon={Banknote} label="Add Funds" />
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            {user && !isAdmin && (
              <button 
                onClick={toggleViewMode}
                className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              >
                <ArrowRightLeft size={16} />
                Switch to {viewMode === 'WORKER' ? 'Advertiser Profile' : 'Worker Profile'}
              </button>
            )}

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
               {!isAdmin && (
                  <div className={`hidden md:flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${viewMode === 'ADVERTISER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {viewMode === 'ADVERTISER' ? 'ADVERTISER' : 'WORKER'} MODE
                  </div>
               )}
               {user && (
                 <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500 font-mono">UID: {user.id}</p>
                    </div>
                    <Avatar user={user} size="md" />
                 </div>
               )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
           {children}
        </div>
      </main>
    </div>
  );
};
