import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmationCallModal from '../components/ConfirmationCallModal';
import { calculateOrderRisk } from '../utils/riskScorer';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle,
  CreditCard,
  HelpCircle
} from 'lucide-react';

export default function RiskPage() {
  const { orders, updateOrderStatus, cancelOrder } = useApp();
  const [filterLevel, setFilterLevel] = useState('all'); // 'all' | 'High' | 'Medium' | 'Low'
  const [selectedOrderForCall, setSelectedOrderForCall] = useState(null);

  // Calculate risk for all active orders
  const ordersWithRisk = orders.map(ord => ({
    ...ord,
    risk: calculateOrderRisk(ord)
  }));

  const highRiskCount = ordersWithRisk.filter(o => o.risk.level === 'High').length;
  const mediumRiskCount = ordersWithRisk.filter(o => o.risk.level === 'Medium').length;
  const lowRiskCount = ordersWithRisk.filter(o => o.risk.level === 'Low').length;

  const filteredOrders = ordersWithRisk.filter(o => {
    if (filterLevel === 'all') return true;
    return o.risk.level === filterLevel;
  });

  const handleVerifyRiskyOrder = (orderId) => {
    updateOrderStatus(orderId, 'Preparing');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Fake-Order Risk & Verification</span>
            {highRiskCount > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                {highRiskCount} High Risk
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Heuristic fraud scoring for Cash-on-Delivery (COD) orders with simulated customer phone verification.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterLevel === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterLevel('High')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterLevel === 'High' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            High Risk ({highRiskCount})
          </button>
          <button
            onClick={() => setFilterLevel('Medium')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterLevel === 'Medium' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medium ({mediumRiskCount})
          </button>
          <button
            onClick={() => setFilterLevel('Low')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterLevel === 'Low' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Low ({lowRiskCount})
          </button>
        </div>
      </div>

      {/* Risk Scorer Explainable Heuristics Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <span>How COD Fraud Risk is Calculated (FYP Heuristic Rules):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-red-400 block">1. Past Cancellations</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">+35 to +50 points if customer cancelled previous deliveries at the doorstep.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-amber-400 block">2. High Value on COD</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">+20 to +35 points if Cash-on-Delivery total exceeds Rs. 3,000 / Rs. 5,000.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-blue-400 block">3. First-time Account</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">+15 points for brand new phone number with 0 completed delivery history.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
            <span className="font-bold text-purple-400 block">4. Bulk Item Spikes</span>
            <p className="text-slate-400 mt-0.5 text-[11px]">+15 points if 4+ quantities of a single burger or 7+ total items are ordered.</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((ord) => {
          const { risk } = ord;

          return (
            <div 
              key={ord.id}
              className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                risk.level === 'High' 
                  ? 'border-red-500/40 hover:border-red-500' 
                  : risk.level === 'Medium' 
                  ? 'border-amber-500/30 hover:border-amber-500' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Order Number & Risk Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{ord.orderNumber}</span>
                    <span className="text-[10px] text-slate-500">{ord.placedAt}</span>
                  </div>

                  {/* Risk Badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                    risk.level === 'High'
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : risk.level === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {risk.level === 'High' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>{risk.level} Risk ({risk.score}%)</span>
                  </span>
                </div>

                {/* Customer Details */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-white font-semibold">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      <span>{ord.customer?.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {ord.customer?.cancelledOrders > 0 ? `${ord.customer.cancelledOrders} cancellations` : 'Clean history'}
                    </span>
                  </div>
                  <p className="text-slate-400">{ord.customer?.phone}</p>
                  <p className="text-slate-400 flex items-start gap-1 pt-1 truncate">
                    <MapPin className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                    <span className="truncate">{ord.address}</span>
                  </p>
                </div>

                {/* Triggered Reasons Chips */}
                {risk.reasons.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Triggered Risk Rules:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {risk.reasons.map((r, i) => (
                        <span key={i} className="text-[10px] bg-red-950/40 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-lg">
                          • {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items & Amount */}
                <div className="pt-2 border-t border-slate-800 text-xs flex justify-between items-center">
                  <span className="text-slate-400">{ord.items?.length} items ({ord.paymentMethod || 'COD'})</span>
                  <span className="font-bold text-white text-sm">Rs. {ord.grandTotal?.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrderForCall({ ...ord, riskReasons: risk.reasons })}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                    risk.level === 'High'
                      ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Confirmation Call</span>
                </button>

                {ord.status !== 'Cancelled' && (
                  <button
                    onClick={() => cancelOrder(ord.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs transition-colors"
                    title="Reject order"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Call Simulation Modal */}
      {selectedOrderForCall && (
        <ConfirmationCallModal
          order={selectedOrderForCall}
          onClose={() => setSelectedOrderForCall(null)}
          onVerifyOrder={handleVerifyRiskyOrder}
          onCancelOrder={cancelOrder}
        />
      )}

    </div>
  );
}
