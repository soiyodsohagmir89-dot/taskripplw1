
import React, { useEffect, useState } from 'react';
import { getGigs, adminUpdateGigStatus, getUserName } from '../../services/mockBackend';
import { Gig, GigStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Check, X, Search, ExternalLink } from 'lucide-react';

export const ManageGigs: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [filterStatus, setFilterStatus] = useState<GigStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadGigs = () => {
    setGigs(getGigs());
  };

  useEffect(() => {
    loadGigs();
  }, []);

  const handleStatusUpdate = (id: string, status: GigStatus) => {
    let reason = undefined;
    if (status === GigStatus.REJECTED) {
      reason = prompt("Enter rejection reason:") || "Violates terms of service";
    }
    if (window.confirm(`Are you sure you want to set this Gig to ${status}?`)) {
       adminUpdateGigStatus(id, status, reason);
       loadGigs();
    }
  };

  const filteredGigs = gigs.filter(g => {
    const matchStatus = filterStatus === 'ALL' || g.status === filterStatus;
    const matchSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || getUserName(g.userId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Gigs</h2>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text"
                    placeholder="Search title or user..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="border rounded-lg px-3 py-2 bg-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
            >
                <option value="ALL">All Status</option>
                <option value={GigStatus.PENDING}>Pending</option>
                <option value={GigStatus.APPROVED}>Approved</option>
                <option value={GigStatus.REJECTED}>Rejected</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3">Gig Info</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredGigs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No gigs found.</td></tr>
              ) : (
                filteredGigs.map(gig => (
                  <tr key={gig.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={gig.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-gray-200" />
                        <div>
                           <p className="font-medium text-gray-900 line-clamp-1">{gig.title}</p>
                           <p className="text-xs text-gray-500">{gig.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        {getUserName(gig.userId)}
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                        ${gig.price}
                    </td>
                    <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                            gig.status === GigStatus.APPROVED ? 'bg-green-100 text-green-700' :
                            gig.status === GigStatus.REJECTED ? 'bg-red-100 text-red-700' :
                            gig.status === GigStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {gig.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a href={`#/marketplace`} className="p-2 text-gray-400 hover:text-gray-600" title="View">
                             <ExternalLink size={16} />
                          </a>
                          {gig.status === GigStatus.PENDING && (
                            <>
                              <Button size="sm" onClick={() => handleStatusUpdate(gig.id, GigStatus.APPROVED)} className="bg-green-600 hover:bg-green-700">
                                  <Check size={16} />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(gig.id, GigStatus.REJECTED)}>
                                  <X size={16} />
                              </Button>
                            </>
                          )}
                          {gig.status === GigStatus.APPROVED && (
                             <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(gig.id, GigStatus.REJECTED)} title="Revoke Approval">
                                <X size={16} />
                             </Button>
                          )}
                        </div>
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
