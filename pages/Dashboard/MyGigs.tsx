import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyGigs, deleteGig } from '../../services/mockBackend';
import { Gig, AccountStatus, GigStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export const MyGigs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<Gig[]>([]);

  useEffect(() => {
    if (user) {
      setGigs(getMyGigs(user.id));
    }
  }, [user]);

  if (!user) return null;

  if (user.status !== AccountStatus.ACTIVE) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <h2 className="text-xl font-bold text-gray-900">Feature Locked</h2>
        <p className="text-gray-500 mt-2">Please activate your account to create and sell Gigs.</p>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Gig?')) {
      deleteGig(id);
      setGigs(getMyGigs(user.id));
    }
  };

  const getStatusBadge = (status: GigStatus) => {
    switch(status) {
      case GigStatus.APPROVED: return <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12} /> Active</span>;
      case GigStatus.PENDING: return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold"><Clock size={12} /> Pending</span>;
      case GigStatus.REJECTED: return <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold"><XCircle size={12} /> Rejected</span>;
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Gigs</h2>
        <Link to="/my-gigs/create">
          <Button className="shadow-lg">
            <Plus className="w-4 h-4 mr-2" /> Create New Gig
          </Button>
        </Link>
      </div>

      {gigs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="inline-block p-4 bg-indigo-50 rounded-full mb-4">
            <Plus className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Gigs Created Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Start selling your services on TaskRipple today. Create your first Gig now!</p>
          <Link to="/my-gigs/create">
            <Button variant="outline">Create Gig</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {gigs.map(gig => (
            <div key={gig.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
              {/* Image */}
              <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img src={gig.imageUrl} alt={gig.title} className="w-full h-full object-cover" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{gig.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Starting at <span className="text-indigo-600 font-bold text-base">${gig.price}</span></p>
                  </div>
                  {getStatusBadge(gig.status)}
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                   <span className="text-xs bg-gray-50 border px-2 py-1 rounded text-gray-600">{gig.category}</span>
                   <span className="text-xs bg-gray-50 border px-2 py-1 rounded text-gray-600">{gig.deliveryTime} Days Delivery</span>
                </div>

                {gig.rejectionReason && gig.status === GigStatus.REJECTED && (
                  <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                    <strong>Reason:</strong> {gig.rejectionReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4">
                {gig.status !== GigStatus.APPROVED && (
                  <Button size="sm" variant="outline" onClick={() => navigate(`/my-gigs/edit/${gig.id}`)} title="Edit">
                    <Edit2 size={16} />
                  </Button>
                )}
                {gig.status !== GigStatus.APPROVED && (
                  <Button size="sm" variant="danger" onClick={() => handleDelete(gig.id)} title="Delete">
                    <Trash2 size={16} />
                  </Button>
                )}
                {gig.status === GigStatus.APPROVED && (
                  <div className="text-xs text-center text-gray-500 italic px-2">
                    Live on Market
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};