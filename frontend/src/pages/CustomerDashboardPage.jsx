import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  User, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RotateCcw, 
  Truck, 
  ChevronRight, 
  MessageSquare, 
  Sparkles, 
  UtensilsCrossed,
  ShieldCheck,
  Edit2,
  Save,
  LogIn
} from 'lucide-react';

export default function CustomerDashboardPage() {
  const { 
    currentUser, 
    orders, 
    openOrderTracker, 
    addToCart, 
    setAuthModalOpen, 
    quickSwitchRole 
  } = useApp();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reorderedId, setReorderedId] = useState(null);

  // Filter orders for this customer (by user_id or customer_name or fallback to all if demo)
  const customerOrders = orders.filter(o => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return true;
    return o.user_id === currentUser.id || 
           o.customer_name === currentUser.name || 
           o.customer?.name === currentUser.name;
  });

  const activeOrders = customerOrders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status));
  const pastOrders = customerOrders.filter(o => ['Delivered', 'Cancelled'].includes(o.status));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.auth.updateProfile({
        name: profileName,
        phone: profilePhone,
        address: profileAddress
      });
      setSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Profile save note:', err);
      setIsEditingProfile(false);
    }
  };

  const handleReorder = (order) => {
    if (!order?.items?.length) return;
    order.items.forEach(item => {
      addToCart(item, item.quantity || 1, item.modifiers || []);
    });
    setReorderedId(order.id);
    setTimeout(() => setReorderedId(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Customer Hub & Order Tracking
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Personal Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track active deliveries in real-time, view your dining history, and manage your account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/menu"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Order Food Now</span>
          </Link>
          <Link
            to="/chat"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Voice/Chat</span>
          </Link>
        </div>
      </div>

      {/* Grid: Profile Summary + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                {currentUser?.name ? currentUser.name.charAt(0) : 'Z'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {currentUser?.name || 'Zainab Ahmed'}
                </h3>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser?.role || 'Valued Customer'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="truncate">{currentUser?.email || 'customer@dastarkhwan.com'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{currentUser?.phone || '+92 300 1234567'}</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{currentUser?.address || 'Flat 304, Al-Razi Heights, Block M, Gulberg III, Lahore'}</span>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Demo Switcher Prompt */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span>Switch Account or Role</span>
            </button>
          </div>
        </div>

        {/* Quick Analytics & Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Orders</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{activeOrders.length}</span>
              <span className="block text-[11px] text-slate-400 mt-1">In kitchen / on delivery</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Completed Orders</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-white">{pastOrders.length}</span>
              <span className="block text-[11px] text-slate-400 mt-1">Delivered successfully</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Dastarkhwan Points</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-amber-400">350</span>
              <span className="block text-[11px] text-slate-400 mt-1">Loyalty rewards ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Active Orders & Live Dispatch
            </h3>
            {activeOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <span className="text-xs text-slate-400">
            {activeOrders.length} active delivery in progress
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mx-auto">
              🍽️
            </div>
            <h4 className="text-sm font-bold text-white">No Active Orders Right Now</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Feeling hungry? Check out our delicious burgers, stone-baked pizzas, and value deals!
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20"
            >
              <span>Explore Restaurant Menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((ord) => (
              <div 
                key={ord.id} 
                className="bg-slate-900 border border-orange-500/30 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{ord.order_number || ord.orderNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      ord.status === 'Ready' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      ord.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{ord.placedAt || 'Recently'}</span>
                </div>

                {/* Items list */}
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs">
                  {ord.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span><strong className="text-orange-400">{it.quantity}x</strong> {it.name}</span>
                      <span className="font-mono text-white">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Total:</span>
                    <span className="text-orange-400">Rs. {(ord.grand_total || ord.grandTotal || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Track Button */}
                <button
                  type="button"
                  onClick={() => openOrderTracker(ord.order_number || ord.orderNumber)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Live Delivery Progress</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders History */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          Dining Order History ({pastOrders.length})
        </h3>

        {pastOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            No completed past orders recorded yet.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Date & Channel</th>
                    <th className="px-5 py-3.5">Items Ordered</th>
                    <th className="px-5 py-3.5">Total Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pastOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-white">
                        {ord.order_number || ord.orderNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        <div>{ord.placedAt || 'Completed'}</div>
                        <span className="text-[10px] text-slate-500">{ord.channel || 'Web'}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {ord.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'Combo meal'}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-white">
                        Rs. {(ord.grand_total || ord.grandTotal || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          ord.status === 'Delivered' 
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openOrderTracker(ord.order_number || ord.orderNumber)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                          >
                            Receipt
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(ord)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{reorderedId === ord.id ? 'Added!' : 'Re-order'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
