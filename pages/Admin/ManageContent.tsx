
import React, { useEffect, useState } from 'react';
import { getPosts, deletePost, getUserName, updateUserStatus } from '../../services/mockBackend';
import { Post, AccountStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { Trash2, Ban, Eye, ExternalLink, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManageContent: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPosts = () => {
      setPosts(getPosts().reverse());
  };

  useEffect(() => {
      loadPosts();
  }, []);

  const handleDelete = (id: string) => {
      if(window.confirm('Delete this post permanently?')) {
          deletePost(id);
          loadPosts();
      }
  };

  const handleBanUser = (userId: string) => {
      if(window.confirm('Ban this user?')) {
          updateUserStatus(userId, AccountStatus.BANNED);
          alert('User banned');
      }
  };

  const filteredPosts = posts.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(p.userId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Moderate Content</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                   className="pl-10 pr-4 py-2 border rounded-lg"
                   placeholder="Search content..."
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                    <tr>
                        <th className="px-6 py-3">Post</th>
                        <th className="px-6 py-3">Author</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Stats</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 max-w-xs">
                                <div className="flex items-center gap-3">
                                    {post.mediaUrl ? (
                                        post.type === 'VIDEO' || post.type === 'SHORT' ? (
                                            <div className="w-12 h-12 bg-black rounded flex items-center justify-center text-white text-xs">Video</div>
                                        ) : (
                                            <img src={post.mediaUrl} className="w-12 h-12 object-cover rounded" />
                                        )
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">Text</div>
                                    )}
                                    <div className="truncate font-medium text-gray-900">{post.title}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">{getUserName(post.userId)}</td>
                            <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{post.type}</span></td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                                {post.views} Views • {post.likes.length} Likes
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <Link to={`/post/${post.id}`} target="_blank">
                                    <Button size="sm" variant="secondary"><ExternalLink size={14}/></Button>
                                </Link>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(post.id)} title="Delete Post"><Trash2 size={14}/></Button>
                                <Button size="sm" variant="danger" onClick={() => handleBanUser(post.userId)} title="Ban User"><Ban size={14}/></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};
