
import React, { useState } from 'react';
import { sendBroadcastNotification } from '../../services/mockBackend';
import { Button } from '../../components/ui/Button';
import { Send, Users, Megaphone, CheckCircle } from 'lucide-react';

export const AdminBroadcast: React.FC = () => {
  const [target, setTarget] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SPECIFIC'>('ALL');
  const [specificUid, setSpecificUid] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = sendBroadcastNotification(target, subject, message, specificUid);
      setStatus(`Success! Sent to ${count} users.`);
      setSubject('');
      setMessage('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Megaphone size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
            <p className="text-gray-500 text-sm">Broadcast messages to your users.</p>
        </div>
      </div>

      {status && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2 mb-4">
            <CheckCircle size={20} /> {status}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSend} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['ALL', 'ACTIVE', 'INACTIVE', 'SPECIFIC'].map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTarget(t as any)}
                            className={`py-2 px-3 rounded border text-sm font-bold transition-all ${
                                target === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {target === 'SPECIFIC' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">User ID (UID)</label>
                    <input 
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter specific User ID"
                        value={specificUid}
                        onChange={e => setSpecificUid(e.target.value)}
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                <input 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Notification Title"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                <textarea 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={5}
                    placeholder="Type your message here..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                />
            </div>

            <Button type="submit" className="w-full py-3 flex items-center justify-center gap-2">
                <Send size={18} /> Send Notification
            </Button>
        </form>
      </div>
    </div>
  );
};
