import React from 'react';
import { 
  X, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ShoppingBag, 
  CreditCard,
  AlertTriangle,
  Bot
} from 'lucide-react';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
              🧾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Order Details {order.orderNumber}
                </h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  order.status === 'New'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : order.status === 'Preparing'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : order.status === 'Ready'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : order.status === 'Delivered'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Channel: {order.channel} • Placed {order.placedAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Customer & Delivery Information */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Customer Profile
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-white text-sm">
                <User className="w-4 h-4 text-orange-400" />
                <span>{order.customer?.name}</span>
                {order.customer?.type === 'flagged' && (
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 rounded font-bold">
                    Risk
                  </span>
                )}
              </div>
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{order.customer?.phone}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                Delivery Address & Payment
              </span>
              <p className="text-slate-300 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                <span>{order.address}</span>
              </p>
              <p className="text-slate-400 flex items-center gap-1 mt-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>{order.paymentMethod || 'Cash on Delivery (COD)'}</span>
              </p>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Ordered Items ({order.items?.length || 0})
            </span>
            <div className="divide-y divide-slate-800/80">
              {order.items?.map((it, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400 w-5">{it.quantity}x</span>
                    <div>
                      <span className="font-medium text-white">{it.name}</span>
                      {it.modifiers?.length > 0 && (
                        <p className="text-[10px] text-slate-400">Modifiers: {it.modifiers.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-slate-300">
                    Rs. {(it.price * it.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Fee</span>
                <span>Rs. {order.deliveryFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800/60">
                <span>Grand Total</span>
                <span className="text-emerald-400">Rs. {order.grandTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Full Chat Transcript of this Order */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Full AI Chat & Voice Transcript
                </h4>
              </div>
              <span className="text-[10px] text-slate-500">
                {order.transcript?.length || 0} interaction turns
              </span>
            </div>

            {order.transcript && order.transcript.length > 0 ? (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                {order.transcript.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div 
                      key={msg.id || i}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-slate-500">
                        {isUser ? (
                          <>
                            <span>{msg.time || 'Customer'}</span>
                            <span className="font-semibold text-orange-400">Customer</span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold text-emerald-400 flex items-center gap-0.5">
                              <Bot className="w-2.5 h-2.5" /> Khaaba AI
                            </span>
                            <span>{msg.time}</span>
                          </>
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-orange-500 text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center">
                No transcript recorded for this order.
              </p>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
