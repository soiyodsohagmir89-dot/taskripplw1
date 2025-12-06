
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createPost } from '../../services/mockBackend';
import { PostType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Type, Image as ImageIcon, Video, MonitorPlay, Upload, X, Lock, BadgeCheck } from 'lucide-react';

export const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [type, setType] = useState<PostType>('TEXT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- RESTRICTION: VERIFIED USERS ONLY ---
  if (user && !user.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
          <Lock className="w-12 h-12 text-gray-400" />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
             <BadgeCheck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Creation Locked</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Only <strong>Verified Users</strong> can post content on TaskRipple. 
          Verify your account to share your thoughts, videos, and images with the community.
        </p>
        <Link 
          to="/activation" 
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          Verify My Account
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validation
      if (type === 'IMAGE' && !file.type.startsWith('image/')) {
          alert('Please upload a valid image'); return;
      }
      if ((type === 'VIDEO' || type === 'SHORT') && !file.type.startsWith('video/')) {
          alert('Please upload a valid video'); return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB Limit for demo
          alert('File size too large (Max 10MB)'); return;
      }

      // Convert to base64 for mock storage
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
          setMediaFile(reader.result as string);
          setIsUploading(false);
      };
      reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      if (type !== 'TEXT' && !mediaFile) {
          alert('Please upload media content');
          return;
      }

      createPost(user.id, {
          type,
          title,
          description,
          mediaUrl: mediaFile || undefined
      });

      navigate('/feed');
  };

  const tabs = [
      { id: 'TEXT', label: 'Text Post', icon: Type },
      { id: 'IMAGE', label: 'Image', icon: ImageIcon },
      { id: 'VIDEO', label: 'Video', icon: MonitorPlay },
      { id: 'SHORT', label: 'Shorts', icon: Video },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
       <div className="border-b border-gray-100 p-4 bg-gray-50">
           <h2 className="font-bold text-lg text-gray-900 text-center">Create New Post</h2>
       </div>

       {/* Tabs */}
       <div className="flex border-b border-gray-100">
           {tabs.map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => { setType(tab.id as PostType); setMediaFile(null); }}
                 className={`flex-1 py-4 text-sm font-medium flex flex-col items-center gap-2 transition-colors ${
                     type === tab.id 
                     ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600' 
                     : 'text-gray-500 hover:bg-gray-50'
                 }`}
               >
                   <tab.icon size={20} />
                   {tab.label}
               </button>
           ))}
       </div>

       <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <div>
               <label className="block text-sm font-semibold text-gray-900 mb-2">Title / Caption</label>
               <input 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Give your post a catchy title..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
               />
           </div>

           <div>
               <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
               <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={4}
                  placeholder="What's on your mind?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
               />
           </div>

           {/* File Upload Section */}
           {type !== 'TEXT' && (
               <div>
                   <label className="block text-sm font-semibold text-gray-900 mb-2">
                       Upload {type === 'IMAGE' ? 'Image' : 'Video'}
                   </label>
                   
                   {!mediaFile ? (
                       <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                           <input 
                              type="file" 
                              accept={type === 'IMAGE' ? 'image/*' : 'video/*'}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleFileChange}
                           />
                           <div className="flex flex-col items-center text-gray-500">
                               {isUploading ? (
                                   <span>Uploading...</span>
                               ) : (
                                   <>
                                     <Upload size={32} className="mb-2 text-gray-400" />
                                     <span className="font-medium">Click to upload</span>
                                     <span className="text-xs mt-1">Max size 10MB</span>
                                   </>
                               )}
                           </div>
                       </div>
                   ) : (
                       <div className="relative rounded-xl overflow-hidden bg-black flex justify-center">
                           {type === 'IMAGE' ? (
                               <img src={mediaFile} alt="Preview" className="max-h-64 w-auto" />
                           ) : (
                               <video src={mediaFile} className="max-h-64 w-auto" controls />
                           )}
                           <button 
                              type="button"
                              onClick={() => setMediaFile(null)}
                              className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full shadow-md"
                           >
                               <X size={16} />
                           </button>
                       </div>
                   )}
                   {type === 'SHORT' && <p className="text-xs text-gray-500 mt-2">Note: Shorts must be under 60 seconds (vertical recommended).</p>}
               </div>
           )}

           <div className="pt-4">
               <Button type="submit" className="w-full py-3 text-lg" disabled={isUploading}>
                   Publish Post
               </Button>
           </div>
       </form>
    </div>
  );
};
