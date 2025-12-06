
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFeed, toggleLikePost, incrementPostView, getUserById, toggleFollowUser } from '../../services/mockBackend';
import { Post, User } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import { Heart, MessageCircle, Share2, Eye, Play, Image as ImageIcon, Video, Lock, BadgeCheck } from 'lucide-react';

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (user && user.isVerified) {
        loadFeed();
        // Initialize liked posts set
        setFollowedUsers(new Set(user.following || []));
    }
  }, [user]);

  const loadFeed = () => {
      const posts = getFeed(user?.id);
      setFeed(posts);
      if (user) {
          const liked = new Set<string>(posts.filter(p => p.likes.includes(user.id)).map(p => p.id));
          setLikedPosts(liked);
      }
  };

  const handleLike = (postId: string) => {
      if (!user) return;
      toggleLikePost(postId, user.id);
      
      // Optimistic UI Update
      setLikedPosts(prev => {
          const next = new Set(prev);
          if (next.has(postId)) next.delete(postId);
          else next.add(postId);
          return next;
      });
      setFeed(prev => prev.map(p => {
          if (p.id === postId) {
              const isLiked = p.likes.includes(user.id);
              const newLikes = isLiked ? p.likes.filter(id => id !== user.id) : [...p.likes, user.id];
              return { ...p, likes: newLikes };
          }
          return p;
      }));
  };

  const handleFollow = (targetUserId: string) => {
      if (!user) return;
      toggleFollowUser(user.id, targetUserId);
      
      // Optimistic Update
      setFollowedUsers(prev => {
          const next = new Set(prev);
          if (next.has(targetUserId)) next.delete(targetUserId);
          else next.add(targetUserId);
          return next;
      });
  };

  const handleShare = (postId: string) => {
      const url = `${window.location.origin}/#/post/${postId}`;
      navigator.clipboard.writeText(url);
      alert('Post link copied to clipboard!');
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Feed Locked</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The Social Section is exclusively available for <strong>Verified Users</strong>. 
          Please activate and verify your account to connect with others, share content, and grow your network.
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

  return (
    <div className="max-w-5xl mx-auto flex gap-8">
       {/* Main Feed */}
       <div className="flex-1 max-w-2xl w-full space-y-6">
          {/* Create Post Prompt */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-3 items-center">
             <Avatar user={user!} size="md" />
             <Link to="/create-post" className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-3 text-gray-500 text-sm transition-colors text-left">
                Share something creative...
             </Link>
             <Link to="/create-post" className="text-indigo-600 p-2 bg-indigo-50 rounded-full hover:bg-indigo-100">
                <ImageIcon size={20} />
             </Link>
             <Link to="/create-post" className="text-pink-600 p-2 bg-pink-50 rounded-full hover:bg-pink-100">
                <Video size={20} />
             </Link>
          </div>

          {feed.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-white rounded-xl border">
                  <p>No posts yet. Be the first to post!</p>
                  <Link to="/create-post" className="inline-block mt-3 text-indigo-600 font-bold">Create Post</Link>
              </div>
          ) : (
              feed.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    isLiked={likedPosts.has(post.id)}
                    onLike={() => handleLike(post.id)}
                    onShare={() => handleShare(post.id)}
                    isFollowing={followedUsers.has(post.userId)}
                    onFollow={() => handleFollow(post.userId)}
                    currentUserId={user?.id}
                  />
              ))
          )}
       </div>

       {/* Sidebar (Desktop) */}
       <div className="hidden lg:block w-80 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
             <h3 className="font-bold text-gray-900 mb-4">Your Stats</h3>
             <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Following</span>
                <span className="font-bold text-gray-900">{user?.following?.length || 0}</span>
             </div>
             <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Followers</span>
                <span className="font-bold text-gray-900">{user?.followers?.length || 0}</span>
             </div>
             <div className="pt-4 border-t text-xs text-gray-400 text-center">
                TaskRipple Social &copy; 2025
             </div>
          </div>
       </div>
    </div>
  );
};

// Post Card Component
const PostCard: React.FC<{ 
    post: Post; 
    isLiked: boolean; 
    onLike: () => void;
    onShare: () => void;
    isFollowing: boolean;
    onFollow: () => void;
    currentUserId?: string;
}> = ({ post, isLiked, onLike, onShare, isFollowing, onFollow, currentUserId }) => {
    const navigate = useNavigate();
    const creator = getUserById(post.userId);
    
    // Handle click to view details
    const handleView = () => {
        incrementPostView(post.id);
        navigate(`/post/${post.id}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Avatar user={creator || { fullName: 'Unknown', id: '0', role: 'USER' } as User} size="md" />
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{creator?.fullName || 'Unknown User'}</p>
                        <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {currentUserId !== post.userId && (
                    <button 
                       onClick={onFollow}
                       className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                           isFollowing 
                           ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                           : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                       }`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="cursor-pointer" onClick={handleView}>
                {/* Description */}
                {post.description && (
                    <div className="px-4 pb-3 text-gray-800 text-sm whitespace-pre-wrap">
                        <h4 className="font-bold mb-1">{post.title}</h4>
                        {post.description}
                    </div>
                )}

                {/* Media */}
                {post.type === 'IMAGE' && post.mediaUrl && (
                    <img src={post.mediaUrl} alt={post.title} className="w-full h-auto object-cover max-h-[600px]" loading="lazy" />
                )}
                
                {post.type === 'SHORT' && post.mediaUrl && (
                    <div className="relative w-full aspect-[9/16] max-h-[600px] bg-black flex items-center justify-center">
                        <video src={post.mediaUrl} className="h-full w-full object-contain" controls />
                        <div className="absolute top-4 right-4 bg-black/50 px-2 py-1 rounded text-white text-xs font-bold flex items-center gap-1">
                            <Play size={12} fill="currentColor" /> Short
                        </div>
                    </div>
                )}

                {post.type === 'VIDEO' && post.mediaUrl && (
                    <div className="w-full bg-black">
                        <video src={post.mediaUrl} className="w-full h-auto max-h-[500px]" controls />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex gap-6">
                    <button 
                        onClick={onLike}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
                    >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        {post.likes.length}
                    </button>
                    
                    <button 
                        onClick={handleView}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                        <MessageCircle size={20} />
                        {post.comments.length}
                    </button>

                    <button 
                        onClick={onShare}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                    >
                        <Share2 size={20} />
                        Share
                    </button>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye size={16} /> {post.views}
                </div>
            </div>
        </div>
    );
};