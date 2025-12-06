
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, getUserById, toggleLikePost, addComment } from '../../services/mockBackend';
import { Post, Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Heart, MessageCircle, Send, Share2, Lock, BadgeCheck } from 'lucide-react';

export const PostView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
      if (id) {
          const p = getPostById(id);
          if (p) {
              setPost(p);
              if (user) setIsLiked(p.likes.includes(user.id));
          } else {
              navigate('/feed');
          }
      }
  }, [id, user, navigate]);

  const handleLike = () => {
      if (!user || !post) return;
      toggleLikePost(post.id, user.id);
      setIsLiked(!isLiked);
      setPost(prev => prev ? { ...prev, likes: isLiked ? prev.likes.filter(l => l !== user.id) : [...prev.likes, user.id] } : null);
  };

  const handleComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !post || !commentText.trim()) return;
      
      const newComment = addComment(post.id, user.id, commentText);
      setPost(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
      setCommentText('');
  };

  if (!user) return null;

  // --- RESTRICTION: VERIFIED USERS ONLY ---
  if (!user.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
          <Lock className="w-12 h-12 text-gray-400" />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
             <BadgeCheck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Viewing Locked</h2>
        <p className="text-gray-500 max-w-md mb-8">
          You must be a <strong>Verified User</strong> to view social content on TaskRipple.
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

  if (!post) return null;
  const creator = getUserById(post.userId);

  return (
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
       <div className="flex-1 bg-black flex items-center justify-center rounded-xl overflow-hidden relative">
           <button onClick={() => navigate('/feed')} className="absolute top-4 left-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
               <ArrowLeft size={24} />
           </button>
           
           {post.type === 'IMAGE' && post.mediaUrl && <img src={post.mediaUrl} className="max-h-full max-w-full object-contain" />}
           {post.type !== 'IMAGE' && post.type !== 'TEXT' && post.mediaUrl && <video src={post.mediaUrl} className="max-h-full max-w-full" controls autoPlay />}
           {post.type === 'TEXT' && (
               <div className="bg-white w-full h-full flex items-center justify-center p-10 text-center">
                   <h1 className="text-3xl font-bold">{post.title}</h1>
               </div>
           )}
       </div>

       <div className="w-full md:w-96 bg-white rounded-xl border border-gray-200 flex flex-col h-full">
           {/* Creator Info */}
           <div className="p-4 border-b flex items-center gap-3">
               <Avatar user={creator!} size="md" />
               <div className="flex-1">
                   <p className="font-bold text-gray-900">{creator?.fullName}</p>
                   <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
               </div>
           </div>

           {/* Description */}
           <div className="p-4 border-b max-h-32 overflow-y-auto bg-gray-50">
               <h2 className="font-bold text-lg mb-1">{post.title}</h2>
               <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.description}</p>
           </div>

           {/* Comments List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {post.comments.length === 0 ? (
                   <p className="text-center text-gray-400 text-sm mt-10">No comments yet.</p>
               ) : (
                   post.comments.map(c => {
                       const cUser = getUserById(c.userId);
                       return (
                           <div key={c.id} className="flex gap-2 items-start">
                               <Avatar user={cUser!} size="sm" showStatus={false} />
                               <div className="bg-gray-100 p-2 rounded-lg rounded-tl-none">
                                   <p className="text-xs font-bold text-gray-900">{cUser?.fullName}</p>
                                   <p className="text-sm text-gray-800">{c.text}</p>
                               </div>
                           </div>
                       );
                   })
               )}
           </div>

           {/* Actions Footer */}
           <div className="p-4 border-t bg-white">
               <div className="flex justify-between mb-4">
                   <div className="flex gap-4">
                       <button onClick={handleLike} className={`flex items-center gap-1 ${isLiked ? 'text-red-600' : 'text-gray-600'}`}>
                           <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                           <span className="font-bold">{post.likes.length}</span>
                       </button>
                       <button className="text-gray-600 flex items-center gap-1">
                           <MessageCircle size={24} />
                           <span className="font-bold">{post.comments.length}</span>
                       </button>
                   </div>
                   <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Copied')}}>
                       <Share2 size={24} className="text-gray-600" />
                   </button>
               </div>

               <form onSubmit={handleComment} className="flex gap-2">
                   <input 
                      className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                   />
                   <button type="submit" disabled={!commentText.trim()} className="text-indigo-600 font-bold disabled:opacity-50">
                       Post
                   </button>
               </form>
           </div>
       </div>
    </div>
  );
};
