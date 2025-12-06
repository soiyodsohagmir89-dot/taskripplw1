
import React, { useEffect, useState } from 'react';
import { getUserMessages, markMessageSeen, replyToMessage, getUserName } from '../../services/mockBackend';
import { UserMessage, MessageStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Reply, Check, Search, RefreshCw, CheckCircle } from 'lucide-react';

export const AdminInbox: React.FC = () => {
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadMessages = () => {
      setMessages(getUserMessages().reverse());
  };

  useEffect(() => {
      loadMessages();
  }, []);

  const handleMarkSeen = (id: string) => {
      markMessageSeen(id);
      loadMessages();
  };

  const handleReply = (e: React.FormEvent) => {
      e.preventDefault();
      if (replyingId) {
          replyToMessage(replyingId, replyText);
          setReplyingId(null);
          setReplyText('');
          loadMessages();
          alert("Reply sent successfully!");
      }
  };

  const filteredMessages = messages.filter(m => 
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      getUserName(m.userId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Support Inbox</h2>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" onClick={loadMessages}><RefreshCw size={18}/></Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
              {filteredMessages.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No messages found.</div>
              ) : (
                  filteredMessages.map(msg => (
                      <div key={msg.id} className={`p-6 transition-colors ${msg.status === MessageStatus.SENT ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="font-bold text-gray-900 text-lg">{msg.subject}</h3>
                                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                      <span className="font-medium text-indigo-600">{getUserName(msg.userId)}</span>
                                      <span>•</span>
                                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                  </div>
                              </div>
                              <div>
                                  {msg.status === MessageStatus.REPLIED ? (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                          <CheckCircle size={12} /> Replied
                                      </span>
                                  ) : msg.status === MessageStatus.SEEN ? (
                                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Seen</span>
                                  ) : (
                                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">New</span>
                                  )}
                              </div>
                          </div>

                          <p className="text-gray-700 text-sm mb-4 bg-white p-3 rounded border border-gray-100">
                              {msg.message}
                          </p>

                          {msg.status === MessageStatus.REPLIED && (
                              <div className="ml-4 pl-4 border-l-4 border-green-200 text-sm text-gray-600 italic mb-4">
                                  <strong>You replied:</strong> {msg.adminReply}
                              </div>
                          )}

                          <div className="flex gap-2">
                              {msg.status === MessageStatus.SENT && (
                                  <Button size="sm" variant="secondary" onClick={() => handleMarkSeen(msg.id)}>
                                      <Check size={14} className="mr-1" /> Mark Seen
                                  </Button>
                              )}
                              {msg.status !== MessageStatus.REPLIED && (
                                  <Button size="sm" onClick={() => setReplyingId(msg.id)}>
                                      <Reply size={14} className="mr-1" /> Reply
                                  </Button>
                              )}
                          </div>

                          {/* Reply Input */}
                          {replyingId === msg.id && (
                              <form onSubmit={handleReply} className="mt-4 animate-in fade-in">
                                  <textarea 
                                      required
                                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm mb-2"
                                      rows={3}
                                      placeholder="Type your reply..."
                                      value={replyText}
                                      onChange={e => setReplyText(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                      <Button type="submit" size="sm">Send Reply</Button>
                                      <Button type="button" size="sm" variant="secondary" onClick={() => setReplyingId(null)}>Cancel</Button>
                                  </div>
                              </form>
                          )}
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};
