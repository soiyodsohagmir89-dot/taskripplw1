
import React, { useEffect, useState } from 'react';
import { getGigs, getUserName } from '../services/mockBackend';
import { Gig, GigStatus, GIG_CATEGORIES } from '../types';
import { Search, Filter, Star } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    // Only show APPROVED gigs to public
    const allGigs = getGigs();
    setGigs(allGigs.filter(g => g.status === GigStatus.APPROVED));
  }, []);

  const filteredGigs = gigs.filter(g => {
    const matchSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = category === 'ALL' || g.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-lg bg-cover bg-center relative overflow-hidden">
         <div className="absolute inset-0 bg-indigo-900/80 z-0"></div>
         <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">Find the perfect service for your business</h1>
            <div className="flex bg-white rounded-lg p-1 shadow-xl">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                        className="w-full pl-10 pr-4 py-3 rounded-l-md focus:outline-none text-gray-900"
                        placeholder="What are you looking for today?"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-md font-bold transition-colors">
                    Search
                </button>
            </div>
         </div>
      </div>

      {/* Categories */}
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        <button 
            onClick={() => setCategory('ALL')}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
        >
            All Categories
        </button>
        {GIG_CATEGORIES.map(cat => (
             <button 
                key={cat}
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Gig Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGigs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
                No services found matching your criteria.
            </div>
        ) : (
            filteredGigs.map(gig => (
                <div key={gig.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                    <div className="h-48 bg-gray-200 overflow-hidden relative">
                        <img src={gig.imageUrl} alt={gig.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4 flex flex-col h-[200px]">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                                {getUserName(gig.userId).charAt(0)}
                             </div>
                             <span className="text-sm font-medium text-gray-900 truncate">{getUserName(gig.userId)}</span>
                        </div>
                        <h3 className="font-medium text-gray-800 line-clamp-2 mb-1 hover:text-indigo-600 transition-colors">
                            {gig.title}
                        </h3>
                        <div className="flex items-center gap-1 mb-auto">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-bold text-gray-700">5.0</span>
                            <span className="text-xs text-gray-400">(New)</span>
                        </div>
                        
                        <div className="border-t pt-3 flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500 uppercase font-medium tracking-wider">Starting at</span>
                            <span className="text-lg font-bold text-gray-900">${gig.price}</span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
