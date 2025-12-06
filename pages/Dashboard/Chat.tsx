import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, DirectMessage } from '../../types';
import { getUsers, getConversations, getMessagesBetweenUsers, sendDirectMessage, markMessagesAsRead } from '../../services/mockBackend';
import { Avatar } from '../../components/ui/Avatar';
import { Send, ArrowLeft, Search, MessageSquarePlus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// A map to store user data for quick lookups
let usersMap: Map<string, User> = new Map();

// Helper to format time
const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const Chat: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partnerUser, setPartnerUser] = useState<User | null>(null);

  // For New Chat Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchUserTerm, setSearchUserTerm] = useState('');

  // Load initial data
  useEffect(() => {
    if (!currentUser) return;

    const all = getUsers();
    usersMap = new Map(all.map(u => [u.id, u]));
    setAllUsers(all.filter(u => u.id !== currentUser.id && u.isVerified)); // Show only verified users to chat with

    const convos = getConversations(currentUser.id);
    setConversations(convos);
  }, [currentUser]);

  // Handle active chat changes
  useEffect(() => {
    if (partnerId && currentUser) {
      setPartnerUser(usersMap.get(partnerId) || null);
      markMessagesAsRead(currentUser.id, partnerId);
      const msgs = getMessagesBetweenUsers(currentUser.id, partnerId);
      setMessages(msgs);
      
      // also update conversation list to remove unread count
      const convos = getConversations(currentUser.id);
      setConversations(convos);
    } else {
      setPartnerUser(null);
      setMessages([]);
    }
  }, [partnerId, currentUser]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !partnerId) return;

    sendDirectMessage(currentUser.id, partnerId, newMessage);
    const msgs = getMessagesBetweenUsers(currentUser.id, partnerId);
    setMessages(msgs);
    setNewMessage('');
    
    // Refresh conversations to show new last message
    const convos = getConversations(currentUser.id);
    setConversations(convos);
  };

  const startNewChat = (newPartner: User) => {
    setIsModalOpen(false);
    navigate(`/chat/${newPartner.id}`);
  };

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchUserTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 flex flex-col ${partnerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
            <MessageSquarePlus size={16} className="mr-2"/> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(convo => {
            const partner = usersMap.get(convo.partnerId);
            if (!partner) return null;
            const isActive = partnerId === convo.partnerId;
            return (
              <div
                key={convo.partnerId}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                onClick={() => navigate(`/chat/${convo.partnerId}`)}
              >
                <Avatar user={partner} size="md" />
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm truncate">{partner.fullName}</p>
                    <p className="text-xs text-gray-400">{formatTime(convo.lastMessage.createdAt)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500 truncate">{convo.lastMessage.text}</p>
                    {convo.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className={`flex-1 flex-col ${partnerId ? 'flex' : 'hidden md:flex'}`}>
        {!partnerId ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        ) : partnerUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3 bg-gray-50">
              <button className="md:hidden" onClick={() => navigate('/chat')}><ArrowLeft/></button>
              <Avatar user={partnerUser} size="md" />
              <div>
                <h3 className="font-bold">{partnerUser.fullName}</h3>
                <p className="text-xs text-gray-500">UID: {partnerUser.id}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{formatTime(msg.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 transition-colors">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Loading chat...</div>
        )}
      </div>

      {/* New Chat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md h-[70vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Start a New Chat</h3>
              <button onClick={() => setIsModalOpen(false)}><X/></button>
            </div>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text"
                  placeholder="Search users by name or ID"
                  className="w-full pl-10 pr-4 py-2 border rounded-full"
                  value={searchUserTerm}
                  onChange={e => setSearchUserTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.map(u => (
                <div 
                  key={u.id} 
                  className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer"
                  onClick={() => startNewChat(u)}
                >
                  <Avatar user={u} size="md" />
                  <div>
                    <p className="font-bold">{u.fullName}</p>
                    <p className="text-xs text-gray-500">{u.id}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};