import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Search, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  AlertCircle, 
  ShoppingBag, 
  Printer, 
  Ban, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function OrderTrackingModal({ isOpen, onClose, defaultOrderNumber = '' }) {
  const { trackingModalData, closeOrderTracker, openOrderTracker, cancelOrder } = useApp();

  const [inputNum, setInputNum] = useState(defaultOrderNumber || trackingModalData?.orderNumber || '');
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // If trackingModalData is open via AppContext or local isOpen
  const activeData = trackingModalData || (isOpen ? { orderNumber: defaultOrderNumber } : null);
  if (!activeData && !isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!inputNum.trim()) return;
    setLoading(true);
    await openOrderTracker(inputNum.trim());
    setLoading(false);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    await cancelOrder(orderId, 'Cancelled by customer from tracking screen');
    // Refresh tracking
    if (activeData?.orderNumber) {
      await openOrderTracker(activeData.orderNumber);
    }
    setCancelling(false);
  };

  const order = activeData?.order;
  const tracking = activeData?.tracking;
  const currentStep = tracking?.current_step ?? (order?.status === 'Delivered' ? 4 : order?.status === 'Ready' ? 3 : order?.status === 'Preparing' ? 2 : 1);
  const isCancelled = order?.status === 'Cancelled';

  const steps = [
    { num: 1, title: 'Order Received', desc: 'Verified by Dastarkhwan AI', icon: ShoppingBag },
    { num: 2, title: 'Kitchen Preparing', desc: 'Chef cooking hot & fresh', icon: ChefHat },
    { num: 3, title: 'Ready for Dispatch', desc: 'Packed & rider assigned', icon: Truck },
    { num: 4, title: 'Delivered', desc: 'Arrived at your doorstep', icon: CheckCircle2 },
  ];

  const handleClose = () => {
    closeOrderTracker();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/20">
            🛵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Live Order Tracking</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Real-Time GPS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Track your delicious meal from our kitchen straight to your address
            </p>
          </div>
        </div>

        {/* Search Order Number Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Order Number e.g. #PK-101"
              value={inputNum}
              onChange={(e) => setInputNum(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Track</span>
          </button>
        </form>

        {activeData?.error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{activeData.error} Try checking #PK-101 or #PK-102.</span>
          </div>
        )}

        {order ? (
          <div className="space-y-6">
            {/* Status Highlight Banner */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isCancelled 
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-slate-950 border-orange-500/30'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{order.order_number || order.orderNumber}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                    isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    order.status === 'Delivered' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    order.status === 'Ready' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    order.status === 'Preparing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {tracking?.status_message || (isCancelled ? 'This order was cancelled.' : 'Your order is progressing smoothly through our kitchen.')}
                </p>
              </div>

              {!isCancelled && (
                <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
                  <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Estimated Arrival</span>
                    <span className="text-xs font-bold text-white">{tracking?.estimated_time || '25-35 mins'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Progress Bar */}
            {!isCancelled && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                {/* Progress bar line */}
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${tracking?.progress_percent || (currentStep * 25)}%` }}
                  />
                </div>

                {/* 4 Stage Stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {steps.map((st) => {
                    const isDone = currentStep >= st.num;
                    const isCurrent = currentStep === st.num;
                    const IconComp = st.icon;

                    return (
                      <div 
                        key={st.num} 
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-md shadow-orange-500/10 ring-1 ring-orange-500/30'
                            : isDone
                            ? 'bg-slate-900/80 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2 text-sm font-bold ${
                          isCurrent
                            ? 'bg-orange-500 text-white'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{st.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details & Delivery Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Delivery Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Delivery Destination
                </h4>
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{order.delivery_address || order.address || 'Address provided on order'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{order.customer_phone || order.customer?.phone || '+92 300 0000000'}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-semibold text-white">{order.payment_method || order.paymentMethod || 'Cash on Delivery (COD)'}</span>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ordered Items ({order.items?.length || 0})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-400">{it.quantity}x</span>
                        <span className="truncate max-w-[160px]">{it.name}</span>
                      </div>
                      <span className="font-mono text-white font-medium">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>Rs. {(order.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee</span>
                    <span>Rs. {(order.delivery_fee || order.deliveryFee || 150).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-orange-400">Rs. {(order.grand_total || order.grandTotal || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Receipt</span>
              </button>

              {['Pending', 'Preparing'].includes(order.status) && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => handleCancel(order.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🔍
            </div>
            <h4 className="text-sm font-bold text-white">Track Any Order Live</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Enter your order number above (e.g. #PK-101, #PK-102) to inspect real-time kitchen status, delivery progress, and items list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
