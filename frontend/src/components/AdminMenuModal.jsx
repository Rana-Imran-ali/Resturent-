import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  UtensilsCrossed, 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'burgers', label: 'Burgers' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'sides', label: 'Sides & Wings' },
  { id: 'drinks', label: 'Beverages' },
  { id: 'deals', label: 'Value Deals' },
];

export default function AdminMenuModal({ isOpen, onClose, editingItem = null }) {
  const { createMenuItem, updateMenuItem } = useApp();

  const [name, setName] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [category, setCategory] = useState('burgers');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);
  const [isSpicy, setIsSpicy] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setNameUr(editingItem.name_ur || '');
      setCategory(editingItem.category || 'burgers');
      setPrice(String(editingItem.price || ''));
      setDescription(editingItem.description || '');
      setIngredients(editingItem.ingredients || '');
      setImage(editingItem.image || '');
      setAvailable(editingItem.available !== false);
      setIsSpicy(Boolean(editingItem.is_spicy));
      setIsPopular(Boolean(editingItem.is_popular));
      setStockQuantity(String(editingItem.stock_quantity || '50'));
    } else {
      setName('');
      setNameUr('');
      setCategory('burgers');
      setPrice('');
      setDescription('');
      setIngredients('');
      setImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop&q=80');
      setAvailable(true);
      setIsSpicy(false);
      setIsPopular(false);
      setStockQuantity('50');
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !price || !category) {
      setError('Please provide food item name, price, and category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        name_ur: nameUr,
        category,
        price: parseFloat(price),
        description,
        ingredients,
        image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=450&fit=crop&q=80',
        available,
        is_spicy: isSpicy,
        is_popular: isPopular,
        stock_quantity: parseInt(stockQuantity, 10) || 50,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, payload);
      } else {
        await createMenuItem(payload);
      }

      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save menu item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {editingItem ? 'Edit Food Menu Item' : 'Add New Food Menu Item'}
            </h3>
            <p className="text-xs text-slate-400">
              Update photos, price, descriptions, and kitchen availability
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Item Name (English)*</label>
              <input
                type="text"
                required
                placeholder="e.g. Crispy Zinger Burger"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Item Name (Urdu script)</label>
              <input
                type="text"
                placeholder="e.g. کرسپی زنگر برگر"
                value={nameUr}
                onChange={(e) => setNameUr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Category*</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Price (PKR Rs.)*</label>
              <input
                type="number"
                required
                min="0"
                step="10"
                placeholder="520"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Image URL & Live Preview */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Food Image URL</label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {image && (
                <div className="w-12 h-10 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-slate-800">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Crispy golden fried fillet layered with spicy garlic mayo and fresh lettuce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Ingredients (comma separated)</label>
            <input
              type="text"
              placeholder="Crispy Chicken, Spicy Mayo, Brioche Bun, Lettuce"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="rounded text-orange-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] font-semibold text-slate-200">In Stock</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="rounded text-orange-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-400" /> Spicy
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-orange-500 focus:ring-0 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Chef Pick
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Food Item' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
