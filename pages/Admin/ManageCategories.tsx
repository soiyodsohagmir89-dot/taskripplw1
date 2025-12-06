import React, { useState, useEffect } from 'react';
import { 
  getCategories, getSubcategories, 
  createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory 
} from '../../services/mockBackend';
import { Category, Subcategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Folder, List, DollarSign, CheckCircle } from 'lucide-react';

export const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'SUBCATEGORIES'>('CATEGORIES');
  const [msg, setMsg] = useState<{ type: 'success', text: string } | null>(null);
  
  // Animation State: Tracks which IDs are currently fading out
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [subForm, setSubForm] = useState<{ categoryId: string; name: string; minBudget: number; status: 'ACTIVE' | 'INACTIVE' }>({ 
    categoryId: '', name: '', minBudget: 0.02, status: 'ACTIVE' 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(getCategories());
    setSubcategories(getSubcategories());
  };

  const showMsg = (text: string) => {
    setMsg({ type: 'success', text });
    setTimeout(() => setMsg(null), 3000);
  };

  // --- Category Handlers ---
  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateCategory(editingItem.id, { name: catForm.name, description: catForm.description });
    } else {
      createCategory(catForm.name, catForm.description);
    }
    closeModals();
    loadData();
  };

  const handleEditCat = (cat: Category) => {
    setEditingItem(cat);
    setCatForm({ name: cat.name, description: cat.description || '' });
    setIsCatModalOpen(true);
  };

  // 2️⃣ DYNAMIC DELETE CATEGORY (With Fade Animation)
  const handleDeleteCat = (id: string) => {
    if (window.confirm('Delete this category? All subcategories under it will also be deleted.')) {
      // 1. Visual Fade Out
      setFadingIds(prev => new Set(prev).add(id));

      // 2. Remove after animation finishes
      setTimeout(() => {
        deleteCategory(id);
        
        // Update local state dynamically (Pure JS Frontend Removal)
        setCategories(prev => prev.filter(c => c.id !== id));
        setSubcategories(prev => prev.filter(s => s.categoryId !== id));
        
        showMsg("Deleted Successfully");
        
        // Cleanup fade state
        setFadingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
      }, 500); // 500ms matches duration-500 in CSS
    }
  };

  // --- Subcategory Handlers ---
  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateSubcategory(editingItem.id, { 
        categoryId: subForm.categoryId, 
        name: subForm.name, 
        minBudget: Number(subForm.minBudget),
        status: subForm.status
      });
    } else {
      createSubcategory(subForm.categoryId, subForm.name, Number(subForm.minBudget));
    }
    closeModals();
    loadData();
  };

  const handleEditSub = (sub: Subcategory) => {
    setEditingItem(sub);
    setSubForm({ categoryId: sub.categoryId, name: sub.name, minBudget: sub.minBudget, status: sub.status });
    setIsSubModalOpen(true);
  };

  // DYNAMIC DELETE SUBCATEGORY (With Fade Animation)
  const handleDeleteSub = (id: string) => {
    if (window.confirm('Delete this subcategory?')) {
      // 1. Visual Fade Out
      setFadingIds(prev => new Set(prev).add(id));

      // 2. Remove after animation
      setTimeout(() => {
        deleteSubcategory(id);
        
        // Frontend State Update
        setSubcategories(prev => prev.filter(s => s.id !== id));
        showMsg("Deleted Successfully");
        
        setFadingIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
      }, 500);
    }
  };

  const closeModals = () => {
    setIsCatModalOpen(false);
    setIsSubModalOpen(false);
    setEditingItem(null);
    setCatForm({ name: '', description: '' });
    setSubForm({ categoryId: categories[0]?.id || '', name: '', minBudget: 0.02, status: 'ACTIVE' });
  };

  const openSubCreate = () => {
    if (categories.length === 0) return alert("Create a category first!");
    setSubForm({ categoryId: categories[0].id, name: '', minBudget: 0.02, status: 'ACTIVE' });
    setIsSubModalOpen(true);
  };

  // Helper to get Category Name
  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  // Dynamic Row Styling for Animation
  const getRowClass = (id: string) => {
      if (fadingIds.has(id)) {
          return 'opacity-0 transform -translate-x-full transition-all duration-500 ease-out bg-red-50';
      }
      return 'transition-all duration-300 hover:bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Manage Categories</h2>
           <p className="text-gray-500 text-sm">Organize tasks and set minimum budget requirements.</p>
        </div>
      </div>

      {msg && (
        <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle size={18} /> {msg.text}
        </div>
      )}

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
        <button 
           onClick={() => setActiveTab('CATEGORIES')}
           className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'CATEGORIES' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
        >
           <Folder size={16} /> Categories
        </button>
        <button 
           onClick={() => setActiveTab('SUBCATEGORIES')}
           className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'SUBCATEGORIES' ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
        >
           <List size={16} /> Subcategories
        </button>
      </div>

      {/* --- CATEGORIES TAB --- */}
      {activeTab === 'CATEGORIES' && (
        <>
          <div className="flex justify-end">
             <Button onClick={() => setIsCatModalOpen(true)} className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Category
             </Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No categories found.</td></tr>
                ) : (
                    categories.map(cat => (
                    <tr key={cat.id} className={getRowClass(cat.id)}>
                        <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                        <td className="px-6 py-4 text-gray-500">{cat.description || '-'}</td>
                        <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{cat.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditCat(cat)} disabled={fadingIds.has(cat.id)}><Edit2 size={14}/></Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteCat(cat.id)} disabled={fadingIds.has(cat.id)}><Trash2 size={14}/></Button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* --- SUBCATEGORIES TAB --- */}
      {activeTab === 'SUBCATEGORIES' && (
        <>
          <div className="flex justify-end">
             <Button onClick={openSubCreate} className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Subcategory
             </Button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3">Subcategory Name</th>
                  <th className="px-6 py-3">Parent Category</th>
                  <th className="px-6 py-3">Min Budget (Worker Reward)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subcategories.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No subcategories found.</td></tr>
                ) : (
                    subcategories.map(sub => (
                    <tr key={sub.id} className={getRowClass(sub.id)}>
                        <td className="px-6 py-4 font-bold text-gray-900">{sub.name}</td>
                        <td className="px-6 py-4 text-indigo-600 font-medium">
                            <div className="flex items-center gap-1">
                                <Folder size={12} /> {getCatName(sub.categoryId)}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-green-600">
                           ${sub.minBudget.toFixed(3)}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {sub.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => handleEditSub(sub)} disabled={fadingIds.has(sub.id)}><Edit2 size={14}/></Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteSub(sub.id)} disabled={fadingIds.has(sub.id)}><Trash2 size={14}/></Button>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Category' : 'New Category'}</h3>
                <form onSubmit={handleCatSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category Name</label>
                        <input required className="w-full border rounded-lg px-3 py-2" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                        <textarea className="w-full border rounded-lg px-3 py-2" rows={2} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} />
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="secondary" onClick={closeModals}>Cancel</Button>
                        <Button type="submit">Save Category</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95">
                <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Subcategory' : 'New Subcategory'}</h3>
                <form onSubmit={handleSubSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Parent Category</label>
                        <select 
                           className="w-full border rounded-lg px-3 py-2 bg-white" 
                           value={subForm.categoryId} 
                           onChange={e => setSubForm({...subForm, categoryId: e.target.value})}
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Subcategory Name</label>
                        <input required className="w-full border rounded-lg px-3 py-2" value={subForm.name} onChange={e => setSubForm({...subForm, name: e.target.value})} placeholder="e.g. YouTube Subscribe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Minimum Budget (Worker Reward)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                               type="number" step="0.001" min="0.001" required 
                               className="w-full border rounded-lg pl-10 pr-3 py-2" 
                               value={subForm.minBudget} 
                               onChange={e => setSubForm({...subForm, minBudget: e.target.value as any})} 
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Advertisers cannot set reward lower than this.</p>
                    </div>
                    {/* Status Toggle - New Requirement */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select 
                            className="w-full border rounded-lg px-3 py-2 bg-white"
                            value={subForm.status}
                            onChange={e => setSubForm({...subForm, status: e.target.value as 'ACTIVE' | 'INACTIVE'})}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="secondary" onClick={closeModals}>Cancel</Button>
                        <Button type="submit">Save Subcategory</Button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};