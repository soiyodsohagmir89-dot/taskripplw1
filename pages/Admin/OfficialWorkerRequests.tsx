import React, { useEffect, useState } from 'react';
import { getOfficialWorkerRequests } from '../../services/mockBackend';
import { OfficialWorkerRequest } from '../../types';
import { Button } from '../../components/ui/Button';
import { Search, RefreshCw, CheckCircle, Smartphone, Key } from 'lucide-react';

export const OfficialWorkerRequests: React.FC = () => {
  const [requests, setRequests] = useState<OfficialWorkerRequest[]>([]);
  const [searchCode, setSearchCode] = useState('');

  const loadRequests = () => {
    // Fetch latest data from "backend"
    const data = getOfficialWorkerRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter Logic
  const filteredRequests = requests.filter(r => 
    (r.secretCode || '').toLowerCase().includes(searchCode.toLowerCase()) ||
    (r.fullName || '').toLowerCase().includes(searchCode.toLowerCase()) ||
    (r.userId || '').toLowerCase().includes(searchCode.toLowerCase())
  );

  // Sort by Date descending
  filteredRequests.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 relative min-h-[500px]">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">High Paying Job User List</h2>
          <p className="text-gray-500 text-sm mt-1">List of users who have successfully joined via Secret Code.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative w-full md:w-64">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Search Name, UID or Code..."
                  value={searchCode}
                  onChange={e => setSearchCode(e.target.value)}
               />
           </div>
           <Button variant="secondary" onClick={loadRequests} title="Refresh List" className="shrink-0">
              <RefreshCw size={18} />
           </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">UID</th>
                <th className="px-6 py-4 font-semibold">Secret Code Used</th>
                <th className="px-6 py-4 font-semibold">Date Applied</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Search size={24} />
                      </div>
                      <p>No users found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900 text-base">
                        {req.fullName}
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Smartphone size={16} /> {req.phone}
                        </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 font-medium">
                      {req.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 flex items-center w-fit gap-2">
                        <Key size={14} /> {req.secretCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                            <CheckCircle size={14} /> APPROVED
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};