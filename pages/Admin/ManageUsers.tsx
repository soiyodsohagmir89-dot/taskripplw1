import React, { useState, useEffect } from 'react';
import { User, UserRole, AccountStatus } from '../../types';
import { getUsers, updateUserStatus, updateUserRole, toggleUserVerification, getUserName } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Search, Shield, ShieldAlert, Ban, CheckCircle, BadgeCheck, Network, Lock, Unlock } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const showMsg = (text: string) => {
    setMsg({ type: 'success', text });
    setTimeout(() => setMsg(null), 3000);
  };

  // --- ACTIONS ---

  const handleBan = (userId: string) => {
    if (window.confirm("Are you sure you want to BAN this user? They will be logged out instantly and cannot login.")) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: AccountStatus.BANNED } : u));
        updateUserStatus(userId, AccountStatus.BANNED);
        showMsg("User has been BANNED.");
    }
  };

  const handleUnban = (userId: string) => {
      if (window.confirm("Unban this user? They will be able to login again.")) {
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: AccountStatus.ACTIVE } : u));
          updateUserStatus(userId, AccountStatus.ACTIVE);
          showMsg("User Unbanned.");
      }
  };

  const handleMakeAdmin = (userId: string) => {
    if (window.confirm("⚠️ SECURITY WARNING: Grant ADMIN access to this user? They will have full control over the system.")) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: UserRole.ADMIN } : u));
        updateUserRole(userId, UserRole.ADMIN);
        showMsg("User granted Admin privileges.");
    }
  };

  const handleRevokeAdmin = (userId: string) => {
     if (window.confirm("Revoke Admin access? This user will become a standard User.")) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: UserRole.USER } : u));
        updateUserRole(userId, UserRole.USER);
        showMsg("Admin privileges revoked.");
     }
  };

  const handleToggleVerify = (userId: string) => {
      const u = users.find(user => user.id === userId);
      if(!u) return;
      
      const newStatus = !u.isVerified;
      setUsers(prev => prev.map(user => user.id === userId ? { ...user, isVerified: newStatus } : user));
      toggleUserVerification(userId);
      showMsg(newStatus ? "User Verified." : "User Unverified.");
  };

  // --- RENDER HELPERS ---

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           u.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRowClass = (status: AccountStatus) => {
      if (status === AccountStatus.BANNED) return 'bg-red-50 border-l-4 border-l-red-500 transition-colors duration-500';
      if (status === AccountStatus.ACTIVE) return 'bg-white hover:bg-gray-50 border-l-4 border-l-transparent transition-colors duration-300';
      return 'bg-yellow-50 border-l-4 border-l-yellow-400 transition-colors duration-300';
  };

  const formatUpline = (chain?: string[]) => {
      if (!chain || chain.length === 0) return "No Upline";
      return chain.map((id, i) => `L${i+1}: ${getUserName(id)}`).join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
            <p className="text-sm text-gray-500 mt-1">Control user roles, status, and verification.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Search UID, Name, Email..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="border rounded-lg px-3 py-2 bg-white"
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as any)}
            >
                <option value="ALL">All Roles</option>
                <option value={UserRole.USER}>Users</option>
                <option value={UserRole.ADMIN}>Admins</option>
            </select>
        </div>
      </div>

      {msg && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
                <tr>
                <th className="px-6 py-3 font-medium">User Profile</th>
                <th className="px-6 py-3 font-medium">Network</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Admin Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No users found matching your criteria.</td></tr>
                ) : (
                    filteredUsers.map(user => {
                        const isBanned = user.status === AccountStatus.BANNED;
                        const isAdmin = user.role === UserRole.ADMIN;
                        
                        return (
                        <tr key={user.id} className={getRowClass(user.status)}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar user={user} size="md" showStatus={true} />
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className={`font-medium ${isBanned ? 'text-red-800' : 'text-gray-900'}`}>{user.fullName}</p>
                                            {user.isVerified && <BadgeCheck size={14} className="text-blue-500" />}
                                        </div>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">{user.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="group relative cursor-pointer flex items-center gap-1 text-indigo-600 w-fit">
                                    <Network size={16} /> 
                                    <span className="text-xs font-bold">View Upline</span>
                                    {/* Tooltip for Chain */}
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white text-xs rounded p-2 hidden group-hover:block z-50 whitespace-pre-line shadow-lg">
                                        {formatUpline(user.referralChain)}
                                    </div>
                                </div>
                            </td>
                            
                            {/* ROLE COLUMN */}
                            <td className="px-6 py-4">
                                {isAdmin ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                                        <Shield size={12} /> ADMIN
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                        User
                                    </span>
                                )}
                            </td>

                            {/* STATUS COLUMN */}
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    user.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                    user.status === AccountStatus.BANNED ? 'bg-red-600 text-white shadow-sm' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {user.status}
                                </span>
                            </td>

                            {/* ACTIONS COLUMN */}
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Verification Toggle */}
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={() => handleToggleVerify(user.id)} 
                                        title={user.isVerified ? "Unverify User" : "Verify User"}
                                        className="h-8 w-8 p-0 flex items-center justify-center"
                                    >
                                        <BadgeCheck className={user.isVerified ? "text-green-600" : "text-gray-400"} size={16} />
                                    </Button>

                                    {/* Role Management */}
                                    {user.role === UserRole.USER ? (
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleMakeAdmin(user.id)} 
                                            title="Grant Admin Access"
                                            className="text-xs"
                                        >
                                            Make Admin
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleRevokeAdmin(user.id)} 
                                            title="Revoke Admin Access"
                                            className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                                        >
                                            Revoke Admin
                                        </Button>
                                    )}

                                    {/* Ban Management */}
                                    {isBanned ? (
                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            onClick={() => handleUnban(user.id)} 
                                            title="Unban User"
                                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                        >
                                            <Unlock size={14} className="mr-1"/> Unban
                                        </Button>
                                    ) : (
                                        <Button 
                                            size="sm" 
                                            variant="danger" 
                                            onClick={() => handleBan(user.id)} 
                                            title="Ban User"
                                            className="flex items-center gap-1"
                                        >
                                            <Ban size={14} /> Ban
                                        </Button>
                                    )}
                                </div>
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