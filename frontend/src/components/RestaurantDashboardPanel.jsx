import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import OrderDetailsModal from './OrderDetailsModal';
import ConfirmationCallModal from './ConfirmationCallModal';
import HumanHandoffModal from './HumanHandoffModal';
import { calculateOrderRisk } from '../utils/riskScorer';
import api from '../services/api';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Truck, 
  ShieldAlert, 
  AlertTriangle, 
  User, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  TrendingUp, 
  XCircle, 
  ChevronRight, 
  DollarSign, 
  UtensilsCrossed, 
  Layers, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  UserCheck,
  Search,
  Users,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'Pending', label: 'New / Pending', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { id: 'Preparing', label: 'Kitchen Preparing', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'Ready', label: 'Ready for Dispatch', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'Delivered', label: 'Completed / Delivered', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' }
];

export default function RestaurantDashboardPanel({ onOpenRoadmap }) {
  const { 
    orders, 
    recentOrderId, 
    updateOrderStatus, 
    cancelOrder, 
    conversationsNeedingAttention, 
    resolveAttention, 
    menu, 
    toggleItemAvailability,
    openOrderTracker
  } = useApp();

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'menu_availability' | 'customers'
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [selectedOrderForCall, setSelectedOrderForCall] = useState(null);
  const [selectedAttentionItem, setSelectedAttentionItem] = useState(null);
  const [menuFilterCat, setMenuFilterCat] = useState('all');

  // Customers Tab State
  const [customersList, setCustomersList] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Fetch customers from backend
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const res = await api.customers.getCustomers();
      if (res?.customers) {
        setCustomersList(res.customers);
      }
    } catch (err) {
      console.warn('Customer fetch note:', err);
      // Fallback demo customers
      setCustomersList([
        { id: 1, name: 'Zainab Ahmed', email: 'customer@dastarkhwan.com', phone: '+92 300 1234567', address: 'Gulberg III, Lahore', risk_level: 'Low', orders_count: 5, total_spent: 6450 },
        { id: 2, name: 'Ali Raza', email: 'ali@dastarkhwan.com', phone: '+92 321 7654321', address: 'Commercial Market, Rawalpindi', risk_level: 'High', orders_count: 2, total_spent: 3720 },
        { id: 3, name: 'Bilal Tariq', email: 'bilal@dastarkhwan.com', phone: '+92 333 9988776', address: 'Sector F-7, Islamabad', risk_level: 'Low', orders_count: 3, total_spent: 4200 }
      ]);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchCustomers();
    }
  }, [activeTab]);

  const handleUpdateRisk = async (customerId, currentRisk) => {
    const nextRisk = currentRisk === 'High' ? 'Low' : currentRisk === 'Low' ? 'Medium' : 'High';
    try {
      await api.customers.updateRisk(customerId, nextRisk);
      setCustomersList(prev => prev.map(c => c.id === customerId ? { ...c, risk_level: nextRisk } : c));
    } catch (err) {
      console.warn('Risk update note:', err);
    }
  };

  // Top Stats Strip Calculations
  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalOrdersToday = orders.length;
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.grand_total || o.grandTotal || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'New' || o.status === 'Preparing').length;
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // Filter orders by search
  const filteredOrders = orders.filter(o => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    const num = (o.order_number || o.orderNumber || '').toLowerCase();
    const name = (o.customer_name || o.customer?.name || '').toLowerCase();
    const phone = (o.customer_phone || o.customer?.phone || '').toLowerCase();
    return num.includes(q) || name.includes(q) || phone.includes(q);
  });

  // Filter menu items for 86 control tab
  const filteredMenuItems = menu.filter(item => {
    if (menuFilterCat === 'all') return true;
    return item.category === menuFilterCat;
  });

  const handleVerifyRiskyOrder = (orderId) => {
    updateOrderStatus(orderId, 'Preparing');
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Restaurant Kitchen &amp; Operations Dashboard
            </h2>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pipeline synced with the AI Customer Chat &amp; Voice ordering agents.
          </p>
        </div>

        {/* View Switcher: Kanban vs Menu 86 Control vs Customers vs Roadmap */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Orders Kanban</span>
            </button>
            <button
              onClick={() => setActiveTab('menu_availability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'menu_availability'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu 86 Stock</span>
              {menu.some(i => !i.available) && (
                <span className="w-2 h-2 rounded-full bg-red-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'customers'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
            </button>
          </div>

          {onOpenRoadmap && (
            <button
              onClick={onOpenRoadmap}
              className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Roadmap</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>Orders Registered</span>
            <ShoppingBag className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {totalOrdersToday}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Live order tickets</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Excluding cancelled</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>Pending Kitchen</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {pendingOrdersCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cooking &amp; prepping</div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-sm">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>Average Order Value</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
            Rs. {avgOrderValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per dining ticket</div>
        </div>
      </div>

      {/* Needs Attention Section (Human Handoff) */}
      {conversationsNeedingAttention.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/70 via-amber-950/70 to-orange-950/70 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>NEEDS ATTENTION: Human Intervention Triggered ({conversationsNeedingAttention.length})</span>
            </div>
          </div>

          <div className="space-y-2">
            {conversationsNeedingAttention.map((attn) => (
              <div 
                key={attn.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/90 p-3.5 rounded-xl text-xs border border-amber-500/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{attn.customer?.name}</span>
                    <span className="text-slate-400">({attn.customer?.phone})</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      {attn.customer?.tag || 'Customer'}
                    </span>
                  </div>
                  <p className="text-amber-200 mt-1 font-medium">
                    ⚠️ Trigger: <span className="underline">{attn.reason}</span>
                  </p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{attn.flaggedAt}</span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setSelectedAttentionItem(attn)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Take Over Chat</span>
                  </button>

                  <button
                    onClick={() => resolveAttention(attn.id)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 1: KANBAN BOARD ───────────────────────────────────────────── */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          
          {/* Order Search Filter */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter orders by #PK-101, customer name, or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="text-xs text-slate-400">
              Showing <strong className="text-white">{filteredOrders.length}</strong> active orders
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
            {KANBAN_COLUMNS.map((col) => {
              // Match Pending and New together in first column
              const colOrders = filteredOrders.filter(o => {
                if (col.id === 'Pending') {
                  return o.status === 'Pending' || o.status === 'New';
                }
                return o.status === col.id;
              });

              return (
                <div 
                  key={col.id} 
                  className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col min-h-[460px] max-h-[640px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">
                      {colOrders.length}
                    </span>
                  </div>

                  {/* Orders Cards List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {colOrders.length === 0 ? (
                      <div className="h-40 flex flex-col items-center justify-center text-slate-600 text-xs text-center border border-dashed border-slate-800 rounded-xl p-4">
                        <span>No orders in this stage</span>
                      </div>
                    ) : (
                      colOrders.map((ord) => {
                        const isJustPlaced = recentOrderId === ord.id || recentOrderId === (ord.order_number || ord.orderNumber);
                        const risk = calculateOrderRisk(ord);

                        return (
                          <div
                            key={ord.id}
                            className={`bg-slate-900 border rounded-2xl p-3.5 space-y-2.5 shadow-md transition-all duration-300 relative ${
                              isJustPlaced
                                ? 'border-emerald-400 ring-2 ring-emerald-400/80 bg-emerald-950/30 animate-pulse'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {/* Card Top: Order Number & Time */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {ord.order_number || ord.orderNumber}
                                </span>
                                {isJustPlaced && (
                                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider animate-bounce">
                                    NEW!
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {ord.placedAt || 'Recently'}
                              </span>
                            </div>

                            {/* Risk Badge Strip */}
                            <div className="flex items-center justify-between gap-1 bg-slate-950/90 px-2 py-1.5 rounded-lg border border-slate-800/80">
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className={`font-black px-1.5 py-0.2 rounded ${
                                  risk.level === 'High' 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                                    : risk.level === 'Medium'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                }`}>
                                  {risk.level} Risk ({risk.score}%)
                                </span>
                              </div>

                              {risk.callNeeded && ord.status !== 'Delivered' && (
                                <button
                                  onClick={() => setSelectedOrderForCall({ ...ord, riskReasons: risk.reasons })}
                                  className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors font-bold"
                                  title="Customer confirmation call recommended"
                                >
                                  <PhoneCall className="w-2.5 h-2.5 text-red-400" />
                                  <span>Verify Call</span>
                                </button>
                              )}
                            </div>

                            {/* Customer & Address Details */}
                            <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl space-y-0.5">
                              <div className="flex items-center justify-between font-semibold text-white">
                                <div className="flex items-center gap-1 truncate">
                                  <User className="w-3 h-3 text-orange-400 shrink-0" />
                                  <span className="truncate">{ord.customer_name || ord.customer?.name}</span>
                                </div>
                                <span className="text-[9px] text-slate-500">
                                  {ord.channel || 'AI Chat'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5 shrink-0" />
                                <span>{ord.customer_phone || ord.customer?.phone}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                                <span className="truncate" title={ord.delivery_address || ord.address}>
                                  {ord.delivery_address || ord.address}
                                </span>
                              </div>
                            </div>

                            {/* Ordered Items */}
                            <div className="space-y-1 text-xs">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="flex items-center justify-between text-slate-200 text-[11px]">
                                  <div className="truncate max-w-[150px]">
                                    <span className="font-bold text-orange-400 mr-1">{it.quantity}x</span>
                                    <span className="truncate">{it.name}</span>
                                  </div>
                                  <span className="text-slate-400 shrink-0">Rs. {it.price * it.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Total & Action shortcuts */}
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block">{ord.payment_method || ord.paymentMethod || 'COD'}</span>
                                <span className="font-bold text-emerald-400 text-xs">
                                  Rs. {(ord.grand_total || ord.grandTotal || 0).toLocaleString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openOrderTracker(ord.order_number || ord.orderNumber)}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                  title="Open live tracking view"
                                >
                                  <Truck className="w-3 h-3 text-emerald-400" />
                                  <span>Track</span>
                                </button>
                                <button
                                  onClick={() => setSelectedOrderForModal(ord)}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                  title="Inspect full transcript"
                                >
                                  <MessageSquare className="w-3 h-3 text-orange-400" />
                                  <span>Details</span>
                                </button>
                              </div>
                            </div>

                            {/* Status Stepper Action Buttons */}
                            <div className="flex items-center gap-1.5 pt-1">
                              {(ord.status === 'Pending' || ord.status === 'New') && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                                  className="flex-1 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                                >
                                  <ChefHat className="w-3 h-3" />
                                  <span>Start Cooking</span>
                                </button>
                              )}

                              {ord.status === 'Preparing' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'Ready')}
                                  className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Mark Ready</span>
                                </button>
                              )}

                              {ord.status === 'Ready' && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, 'Delivered')}
                                  className="flex-1 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-sm active:scale-95"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}

                              {ord.status !== 'Delivered' && (
                                <button
                                  onClick={() => cancelOrder(ord.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold transition-colors"
                                  title="Cancel this order"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancelled Orders Drawer */}
          {orders.some(o => o.status === 'Cancelled') && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Cancelled Orders ({orders.filter(o => o.status === 'Cancelled').length})
              </span>
              <div className="flex flex-wrap gap-2">
                {orders.filter(o => o.status === 'Cancelled').map(o => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderForModal(o)}
                    className="text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-2"
                  >
                    <span className="font-semibold text-white">{o.order_number || o.orderNumber}</span>
                    <span className="text-slate-400">({o.customer_name || o.customer?.name})</span>
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded font-bold">Cancelled</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: MENU STOCK 86 CONTROL ─────────────────────────────────── */}
      {activeTab === 'menu_availability' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-orange-400" />
                Live 86 / Stock Availability Control
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle dishes out of stock. The AI Chatbot immediately respects availability and recommends alternatives to customers!
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {['all', 'deals', 'burgers', 'pizza', 'sides', 'drinks'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setMenuFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    menuFilterCat === cat
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredMenuItems.map((item) => (
              <div 
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.available
                    ? 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    : 'bg-red-950/20 border-red-500/30'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white text-xs truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">Rs. {item.price}</span>
                    <span className="text-[10px] text-slate-500">• {item.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${item.available ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.available ? '● In Stock' : '● Sold Out (86\'d)'}
                  </span>
                </div>

                <button
                  onClick={() => toggleItemAvailability(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    item.available
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                      : 'bg-red-500 text-white shadow-red-500/20 hover:bg-emerald-500'
                  }`}
                >
                  {item.available ? 'In Stock' : '86\'d (Off)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: CUSTOMERS & FRAUD RISK ─────────────────────────────────── */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                Customer Directory &amp; Risk Profiling
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review verified customer accounts, order frequency, delivery addresses, and risk status.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={customersLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${customersLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Contact Info</th>
                    <th className="px-5 py-3.5">Delivery Address</th>
                    <th className="px-5 py-3.5">Orders Placed</th>
                    <th className="px-5 py-3.5">Total Spent</th>
                    <th className="px-5 py-3.5">Risk Level</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {customersList.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                          {cust.name.charAt(0)}
                        </div>
                        <span>{cust.name}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-400">
                        <div>{cust.email}</div>
                        <span className="text-[10px] text-slate-500">{cust.phone}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 max-w-[200px] truncate" title={cust.address}>
                        {cust.address}
                      </td>
                      <td className="px-5 py-4 font-bold text-white">
                        {cust.orders_count || 1} orders
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-emerald-400">
                        Rs. {(cust.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          cust.risk_level === 'High'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : cust.risk_level === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        }`}>
                          {cust.risk_level || 'Low'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleUpdateRisk(cust.id, cust.risk_level || 'Low')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                          title="Cycle risk level: Low -> Medium -> High"
                        >
                          Toggle Risk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal 1: Order Details & Transcript Modal */}
      {selectedOrderForModal && (
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />
      )}

      {/* Modal 2: Confirmation Call Modal for Risky Orders */}
      {selectedOrderForCall && (
        <ConfirmationCallModal
          order={selectedOrderForCall}
          onClose={() => setSelectedOrderForCall(null)}
          onVerifyOrder={handleVerifyRiskyOrder}
          onCancelOrder={cancelOrder}
        />
      )}

      {/* Modal 3: Live Customer Takeover Modal */}
      {selectedAttentionItem && (
        <HumanHandoffModal
          isOpen={Boolean(selectedAttentionItem)}
          onClose={() => setSelectedAttentionItem(null)}
          attentionItem={selectedAttentionItem}
        />
      )}

    </div>
  );
}
