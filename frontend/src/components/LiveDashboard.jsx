import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import HumanHandoffModal from './HumanHandoffModal';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  UserCheck, 
  DollarSign, 
  Phone, 
  MapPin, 
  Mic, 
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function LiveDashboard() {
  const {
    liveOrders,
    updateOrderStatus,
    conversationStatus,
    handoffReason,
    triggerManualHandoff,
    setActiveTab
  } = useRestaurant();

  const [filter, setFilter] = useState('all');
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [selectedOrderForRisk, setSelectedOrderForRisk] = useState(null);

  // Stats calculations
  const totalOrders = liveOrders.length;
  const pendingOrders = liveOrders.filter(o => o.status === 'pending').length;
  const preparingOrders = liveOrders.filter(o => o.status === 'preparing').length;
  const readyOrders = liveOrders.filter(o => o.status === 'ready').length;
  const deliveredOrders = liveOrders.filter(o => o.status === 'delivered').length;
  const totalRevenue = liveOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Filtered orders
  const filteredOrders = liveOrders.filter(o => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Real-time Attention Alert */}
      {conversationStatus === 'handed_off' && (
        <div className="bg-gradient-to-r from-amber-950 to-orange-950 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                URGENT: Customer Requested Human Handoff!
              </h3>
              <p className="text-xs text-amber-300">
                Reason: {handoffReason || 'Customer requested live manager'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHandoffModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            Take Over Chat Now
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalOrders}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>● Live synced</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Confirm</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Awaiting restaurant accept
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>In Kitchen</span>
            <ChefHat className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{preparingOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cooking now
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Delivered / Done</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{deliveredOrders}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Completed orders
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cash on Delivery (PKR)
          </div>
        </div>

      </div>

      {/* Main Order Board Header & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Kitchen & Dispatch Operations
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">
              Orders created by the AI Agent in chat/voice appear here instantly.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalOrders})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({pendingOrders})
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'preparing' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kitchen ({preparingOrders})
            </button>
            <button
              onClick={() => setFilter('ready')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'ready' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ready ({readyOrders})
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'delivered' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Delivered ({deliveredOrders})
            </button>
          </div>
        </div>

        {/* Orders Card Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Is category mein koi order nahi mila.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isHighRisk = order.riskScore >= 50;
              const isMediumRisk = order.riskScore >= 25 && order.riskScore < 50;

              return (
                <div
                  key={order.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
                >
                  {/* Order Top Info */}
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-orange-400">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">{order.createdAt}</span>
                      </div>

                      {/* Channel Badge */}
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
                        {order.channel === 'voice' ? (
                          <><Mic className="w-2.5 h-2.5 text-orange-400" /> Voice AI</>
                        ) : (
                          <><MessageSquare className="w-2.5 h-2.5 text-blue-400" /> Chat AI</>
                        )}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="mt-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{order.customer?.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" /> {order.customer?.phone}
                        </p>
                      </div>

                      {/* Fake / Cancellation Risk Badge */}
                      <button
                        onClick={() => setSelectedOrderForRisk(selectedOrderForRisk?.id === order.id ? null : order)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                          isHighRisk
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                            : isMediumRisk
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                        title="Click to view fake/cancel risk analysis"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Risk: {order.riskScore}%
                      </button>
                    </div>

                    {/* Risk Details popover if clicked */}
                    {selectedOrderForRisk?.id === order.id && (
                      <div className="mt-2 p-2 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-300 space-y-1">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Risk Assessment Breakdown:
                        </div>
                        {order.riskReasons?.length > 0 ? (
                          order.riskReasons.map((r, i) => (
                            <div key={i} className="text-slate-400">• {r}</div>
                          ))
                        ) : (
                          <div className="text-emerald-400">Regular order, safe customer.</div>
                        )}
                      </div>
                    )}

                    {/* Delivery Address */}
                    <div className="mt-2 text-[11px] text-slate-400 flex items-start gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{order.address}</span>
                    </div>

                    {/* Items List */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                        Order Items
                      </span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-300">
                          <span>
                            <strong className="text-orange-400 font-mono">{it.quantity}x</strong> {it.name}
                            {it.modifiers?.length > 0 && (
                              <span className="text-[10px] text-slate-400 ml-1">({it.modifiers.join(', ')})</span>
                            )}
                          </span>
                          <span className="text-slate-400">Rs. {it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer & Action Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-400">Total COD</span>
                      <span className="text-sm font-bold text-white">Rs. {order.grandTotal}</span>
                    </div>

                    {/* Stepper Status Buttons */}
                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                          >
                            Accept & Send to Kitchen
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          Mark Ready for Delivery
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark as Delivered
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="w-full text-center py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                          ✓ Completed & Paid
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="w-full text-center py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
                          ✕ Cancelled
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Human Handoff Modal */}
      <HumanHandoffModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
      />

    </div>
  );
}
