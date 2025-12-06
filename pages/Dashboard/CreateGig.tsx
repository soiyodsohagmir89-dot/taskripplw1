import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createGig, updateGig, getGigs } from '../../services/mockBackend';
import { GIG_CATEGORIES, Gig, GigStatus } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Info } from 'lucide-react';

export const CreateGig: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{id?: string}>(); // If editing
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: GIG_CATEGORIES[0],
    subcategory: '',
    tags: '',
    price: 5,
    deliveryTime: 3,
    revisions: 1,
    imageUrl: '',
    status: GigStatus.DRAFT
  });

  useEffect(() => {
    if (id) {
      const allGigs = getGigs();
      const existing = allGigs.find(g => g.id === id);
      if (existing && existing.userId === user?.id) {
        setFormData({
          title: existing.title,
          description: existing.description,
          category: existing.category,
          subcategory: existing.subcategory || '',
          tags: existing.tags.join(', '),
          price: existing.price,
          deliveryTime: existing.deliveryTime,
          revisions: existing.revisions,
          imageUrl: existing.imageUrl,
          status: existing.status
        });
      } else {
        navigate('/my-gigs');
      }
    }
  }, [id, user, navigate]);

  const handleSubmit = (status: GigStatus) => (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const gigPayload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      price: Number(formData.price),
      deliveryTime: Number(formData.deliveryTime),
      revisions: Number(formData.revisions),
      status: status // DRAFT or PENDING
    };

    if (id) {
      updateGig(id, gigPayload);
    } else {
      createGig(user.id, gigPayload);
    }
    navigate('/my-gigs');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/my-gigs')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Gigs
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{id ? 'Edit Gig' : 'Create New Gig'}</h2>
        
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Gig Title</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500">I will</span>
              <input 
                name="title"
                required
                className="w-full border border-gray-300 rounded-r-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="do something really good"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
              <select 
                name="category"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.category}
                onChange={handleChange}
              >
                {GIG_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Subcategory (Optional)</label>
              <input 
                name="subcategory"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="e.g. Logo Design"
                value={formData.subcategory}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
            <textarea 
              name="description"
              required
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Describe your service in detail..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Media */}
          <div>
             <label className="block text-sm font-semibold text-gray-900 mb-1">Cover Image URL</label>
             <input 
                name="imageUrl"
                type="url"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Info size={12} /> Provide a direct link to an image (Unsplash, etc). This will be shown on the marketplace.
              </p>
              {formData.imageUrl && (
                <div className="mt-2 w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
          </div>

          {/* Pricing & Logistics */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Price ($)</label>
              <input 
                name="price"
                type="number"
                min="5"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.price}
                onChange={handleChange}
              />
             </div>
             <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Delivery (Days)</label>
              <input 
                name="deliveryTime"
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.deliveryTime}
                onChange={handleChange}
              />
             </div>
             <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Revisions</label>
              <input 
                name="revisions"
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                value={formData.revisions}
                onChange={handleChange}
              />
             </div>
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Tags</label>
            <input 
              name="tags"
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Comma separated tags (e.g. logo, design, art)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex gap-4 justify-end">
             <Button variant="secondary" type="button" onClick={handleSubmit(GigStatus.DRAFT)}>
               Save as Draft
             </Button>
             <Button type="button" onClick={handleSubmit(GigStatus.PENDING)}>
               Submit for Approval
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};