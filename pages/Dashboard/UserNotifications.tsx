
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications } from '../../services/mockBackend';
import { Notification } from '../../types';
import { Bell, CheckCircle, Megaphone } from 'lucide-react';

export const UserNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
      if(user) {
          setNotifs(getNotifications(user.id));
      }
  }, [user]);

  if(!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                <Bell size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
            {notifs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 text-gray-500">
                    No notifications yet.
                </div>
            ) : (
                notifs.map(n => (
                    <div key={n.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex gap-4">
                        <div className={`p-2 rounded-full h-fit ${
                            n.type === 'REPLY' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {n.type === 'REPLY' ? <CheckCircle size={20}/> : <Megaphone size={20}/>}
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-gray-900">{n.subject}</h3>
                                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{n.message}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
