import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import AdminMenuModal from '../components/AdminMenuModal';
import OrderTrackingModal from '../components/OrderTrackingModal';
import api from '../services/api';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  ShoppingBag,
  Sparkles,
  Flame,
  ChevronRight,
  UtensilsCrossed,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash,
  Bot,
  ArrowRight,
  Tag,
  Check,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🍽️' },
  { id: 'burgers', label: 'Burgers', icon: '🍔' },
  { id: 'pizza', label: 'Pizzas', icon: '🍕' },
  { id: 'sides', label: 'Sides & Wings', icon: '🍟' },
  { id: 'drinks', label: 'Beverages', icon: '🥤' },
  { id: 'deals', label: 'Value Deals', icon: '🔥' },
];

const QUICK_PROMPTS = [
  "Mujhe spicy chicken burger chahiye",
  "Large cheesy fajita pizza",
  "Thandi pepsi aur hot wings",
  "Midnight zinger combo deal"
];

// ─── Mini Cart Drawer ─────────────────────────────────────────────────────────
function CartDrawer({ isOpen, onClose, onOrderPlaced }) {
  const { cart, setCart, removeFromCart, clearCart, placeOrder, openOrderTracker } = useApp();
  const [ordering, setOrdering] = useState(false);

  const changeQty = (itemId, delta) => {
    setCart(prev => {
      const updatedItems = prev.items
        .map(i => (i.id === itemId || i.item_code === itemId) ? { ...i, quantity: i.quantity + delta } : i)
        .filter(i => i.quantity > 0);
      const subtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const deliveryFee = updatedItems.length > 0 ? 150 : 0;
      return { ...prev, items: updatedItems, subtotal, deliveryFee, grandTotal: subtotal + deliveryFee };
    });
  };

  const handleCheckout = async () => {
    if (!cart.items.length) return;
    setOrdering(true);
    try {
      const created = await placeOrder({
        channel: 'Web Order'
      });
      onClose();
      if (created) {
        onOrderPlaced(created.order_number || created.orderNumber);
      }
    } finally {
      setOrdering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Cart</h3>
              <span className="text-[10px] text-slate-400">{cart.items.length} item(s)</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="text-5xl">🛒</div>
              <p className="text-slate-300 font-medium text-sm">Your cart is empty</p>
              <p className="text-slate-500 text-xs">Add items from the menu to start ordering</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div
                key={item.id || item.item_code}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-xs text-orange-400 font-bold mt-0.5">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                  <button
                    onClick={() => changeQty(item.id || item.item_code, -1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => changeQty(item.id || item.item_code, 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id || item.item_code)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals + Actions */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rs. {cart.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Standard Delivery</span>
                <span>Rs. {cart.deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                <span>Total (COD)</span>
                <span className="text-orange-400">Rs. {cart.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={ordering}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {ordering ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Confirm Order (Rs. {cart.grandTotal.toLocaleString()})</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={clearCart}
              className="w-full py-2 rounded-xl text-slate-400 hover:text-red-400 text-xs font-medium transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Food Menu Card Component ─────────────────────────────────────────────────
function MenuItemCard({ item, onAddToCart, isAdmin, onToggleAvailability, onEditItem, onDeleteItem }) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    if (!item.available) return;
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className={`group relative bg-slate-900 border rounded-3xl overflow-hidden flex flex-col shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        !item.available
          ? 'border-red-500/20 opacity-70'
          : item.is_popular
          ? 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-orange-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Food Image */}
      <div className="relative h-48 overflow-hidden bg-slate-800">
        {!imgError && item.image ? (
          <img
            src={item.image}
            alt={item.name}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !item.available ? 'grayscale' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-slate-800 to-slate-900">
            {item.category === 'burgers' ? '🍔' :
             item.category === 'pizza' ? '🍕' :
             item.category === 'sides' ? '🍟' :
             item.category === 'drinks' ? '🥤' : '🔥'}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Badges on Top Left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {item.is_popular && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              Chef's Pick
            </span>
          )}
          {item.is_spicy && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white flex items-center gap-1 shadow-lg">
              <Flame className="w-3 h-3" />
              Spicy
            </span>
          )}
          {!item.available && (
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-lg animate-pulse">
              Sold Out (86'd)
            </span>
          )}
        </div>

        {/* Price tag on Bottom Right */}
        <div className="absolute bottom-3 right-3">
          <span className="text-sm font-extrabold text-white bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            Rs. {Number(item.price).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">
                {item.name}
              </h4>
              {item.name_ur && (
                <span className="text-xs font-medium text-amber-400/90 font-serif block mt-0.5" dir="rtl">
                  {item.name_ur}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.ingredients && (
            <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1 line-clamp-1">
              <Tag className="w-3 h-3 text-slate-600 shrink-0" />
              <span>{item.ingredients}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {isAdmin ? (
            /* Admin Management Strip */
            <div className="w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onToggleAvailability(item.id || item.item_code)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                  item.available
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                }`}
              >
                {item.available ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                <span>{item.available ? 'In Stock' : '86 Sold Out'}</span>
              </button>

              <button
                type="button"
                onClick={() => onEditItem(item)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Edit Food Item"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id || item.item_code)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Delete Item"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Customer Add to Cart */
            <div className="w-full flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {item.category}
              </span>

              <button
                type="button"
                disabled={!item.available}
                onClick={handleAdd}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  !item.available
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : added
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-orange-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function MenuPage() {
  const { 
    menu, 
    cart, 
    addToCart, 
    isAdmin, 
    toggleItemAvailability, 
    deleteMenuItem,
    openOrderTracker
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackedOrderNum, setTrackedOrderNum] = useState('');

  // Smart Food Recommendation State
  const [smartPrompt, setSmartPrompt] = useState('');
  const [smartResult, setSmartResult] = useState(null);
  const [smartLoading, setSmartLoading] = useState(false);
  const [isSmartActive, setIsSmartActive] = useState(false);

  // Handle Smart Natural Language Craving Search
  const handleSmartSearch = async (queryText) => {
    const q = queryText || smartPrompt;
    if (!q.trim()) return;
    setSmartLoading(true);
    setIsSmartActive(true);
    try {
      const res = await api.menu.smartRecommend(q.trim());
      setSmartResult(res);
    } catch (err) {
      console.warn('Smart recommendation note:', err);
    } finally {
      setSmartLoading(false);
    }
  };

  const handleClearSmart = () => {
    setSmartPrompt('');
    setSmartResult(null);
    setIsSmartActive(false);
  };

  // Filter items
  const filteredItems = menu.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) ||
      (item.name_ur && item.name_ur.includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  const cartTotalQty = cart.items.reduce((s, i) => s + i.quantity, 0);

  const handleOrderPlaced = (orderNumber) => {
    setTrackedOrderNum(orderNumber);
    setTrackingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Dastarkhwan Dining Menu
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Fresh Daily
            </span>
            {isAdmin && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Admin Edit Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our artisan burgers, pizzas, sides, and family deals.
          </p>
        </div>

        {/* Top Controls: Cart Button + Admin Add Item */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={() => { setEditingItem(null); setAdminModalOpen(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Item</span>
            </button>
          )}

          <button
            onClick={() => setCartDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95 relative"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart</span>
            {cartTotalQty > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-orange-600 text-[11px] font-black">
                {cartTotalQty}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── AI Smart Food Recommendation & Natural Language Finder ────────── */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/40 border border-orange-500/30 rounded-3xl p-5 shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                AI Smart Food Craving Search & Recommendation
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Urdu &amp; English NLP
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Type your craving in Roman Urdu or English (e.g. <em>"Mujhe spicy chicken burger chahiye"</em>) and our smart AI matches ingredients &amp; recommends dishes!
            </p>
          </div>

          {/* Search Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSmartSearch(); }} 
            className="w-full lg:w-96 flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ask craving e.g. Spicy chicken burger..."
                value={smartPrompt}
                onChange={(e) => setSmartPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={smartLoading}
              className="px-3.5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {smartLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Find</span>
            </button>
            {isSmartActive && (
              <button
                type="button"
                onClick={handleClearSmart}
                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                title="Clear AI search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Quick prompt suggestions chips */}
        <div className="flex items-center gap-2 pt-3 flex-wrap text-xs">
          <span className="text-[11px] text-slate-500 font-semibold">Try asking:</span>
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setSmartPrompt(p); handleSmartSearch(p); }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-orange-400 border border-slate-800/80 transition-colors"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* Smart Recommendations Results Tray */}
        {isSmartActive && smartResult && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {smartResult.explanation}
              </span>
              <button
                onClick={handleClearSmart}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                View full menu
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {smartResult.matches?.map((m) => (
                <div 
                  key={m.id}
                  className="bg-slate-950 border border-orange-500/40 rounded-2xl p-3 flex flex-col justify-between space-y-2 shadow-lg"
                >
                  <div className="flex gap-2.5">
                    <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{m.name}</h5>
                      <span className="text-xs text-orange-400 font-bold block">Rs. {m.price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(m)}
                    className="w-full py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              ))}
            </div>

            {smartResult.alternatives?.length > 0 && (
              <div className="pt-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Also recommended alternatives: </span>
                {smartResult.alternatives.map(a => a.name).join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search & Category Filter Navigation */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const count = cat.id === 'all' 
              ? menu.length 
              : menu.filter(i => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  isActive ? 'bg-black/20 text-white' : 'bg-slate-950 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Regular Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food by name, ingredients, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-slate-900/50 border border-slate-800 rounded-3xl">
          <div className="text-5xl">🔍</div>
          <h4 className="text-base font-bold text-white">No Menu Items Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn't find any dishes matching "{searchQuery}". Try searching for burgers, pizzas, or drinks!
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id || item.item_code}
              item={item}
              isAdmin={isAdmin}
              onAddToCart={addToCart}
              onToggleAvailability={toggleItemAvailability}
              onEditItem={(it) => { setEditingItem(it); setAdminModalOpen(true); }}
              onDeleteItem={(id) => {
                if (window.confirm('Are you sure you want to delete this menu item?')) {
                  deleteMenuItem(id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Admin Menu Modal */}
      <AdminMenuModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        editingItem={editingItem}
      />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        defaultOrderNumber={trackedOrderNum}
      />

    </div>
  );
}
