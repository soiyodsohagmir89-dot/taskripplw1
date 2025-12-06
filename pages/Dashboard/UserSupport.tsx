
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserMessagesByUserId, sendUserMessage } from '../../services/mockBackend';
import { UserMessage, MessageStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Send, MessageSquare, Clock, CheckCircle, MessageCircle } from 'lucide-react';

export const UserSupport: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [subject, setSubject] = useState('');
  const [msgText, setMsgText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadHistory = () => {
      if(user) setMessages(getUserMessagesByUserId(user.id));
  };

  useEffect(() => {
      loadHistory();
  }, [user]);

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if(!user) return;
      
      setIsSubmitting(true);
      setTimeout(() => {
          sendUserMessage(user.id, subject, msgText);
          setSubject('');
          setMsgText('');
          setIsSubmitting(false);
          loadHistory();
      }, 1000);
  };

  if(!user) return null;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Send Form */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Send className="text-indigo-600"/> Contact Admin
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                        <input 
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Issue summary..."
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea 
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            rows={6}
                            placeholder="Describe your issue or request..."
                            value={msgText}
                            onChange={e => setMsgText(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <Button type="submit" className="w-full py-3" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                </form>
            </div>
        </div>

        {/* History */}
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="text-green-600"/> History
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.length === 0 ? (
                    <div className="text-gray-500 italic">No messages sent yet.</div>
                ) : (
                    messages.map(m => (
                        <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900">{m.subject}</h3>
                                {m.status === MessageStatus.REPLIED ? (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold flex items-center gap-1">
                                        <CheckCircle size={12}/> Replied
                                    </span>
                                ) : m.status === MessageStatus.SEEN ? (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Seen</span>
                                ) : (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold flex items-center gap-1">
                                        <Clock size={12}/> Sent
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">{m.message}</p>
                            
                            {m.status === MessageStatus.REPLIED && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1">
                                        <MessageCircle size={12}/> Admin Reply:
                                    </p>
                                    <p className="text-sm text-gray-800">{m.adminReply}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2 text-right">{new Date(m.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};
