import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  User, 
  MapPin, 
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

export default function ConfirmationCallModal({ order, onClose, onVerifyOrder, onCancelOrder }) {
  const [callStage, setCallStage] = useState('dialing'); // 'dialing' | 'ringing' | 'connected'
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!order) return;

    // Simulate call flow
    const t1 = setTimeout(() => setCallStage('ringing'), 1400);
    const t2 = setTimeout(() => setCallStage('connected'), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [order]);

  // Duration timer once connected
  useEffect(() => {
    let interval;
    if (callStage === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStage]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-5 text-center relative">
        
        {/* Top Risk Warning Badge */}
        <div className="flex items-center justify-center gap-2 bg-red-950/40 border border-red-500/30 py-1.5 px-3 rounded-full mx-auto text-xs text-red-300">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>Automated COD Fraud Prevention Call</span>
        </div>

        {/* Calling Avatar & Status Animation */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            {/* Animated Pulsing Ring */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl transition-all ${
              callStage === 'connected'
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400'
                : 'bg-orange-500/20 border-2 border-orange-400 text-orange-400 animate-pulse'
            }`}>
              📞
            </div>
            {callStage !== 'connected' && (
              <span className="absolute inset-0 rounded-full border-2 border-orange-500/50 animate-ping" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{order.customer?.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{order.customer?.phone}</p>
            <div className="text-xs font-semibold mt-1">
              {callStage === 'dialing' && <span className="text-amber-400">Dialing customer...</span>}
              {callStage === 'ringing' && <span className="text-amber-400 animate-pulse">Ringing (+92 phone line)...</span>}
              {callStage === 'connected' && (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected ({String(Math.floor(callDuration / 60)).padStart(2, '0')}:{String(callDuration % 60).padStart(2, '0')})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Order Details & Flag Reasons Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span className="font-bold text-white">{order.orderNumber}</span>
            <span className="text-emerald-400 font-bold">Rs. {order.grandTotal?.toLocaleString()} (COD)</span>
          </div>

          <p className="text-[11px] text-slate-400 flex items-start gap-1">
            <MapPin className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
            <span className="truncate">{order.address}</span>
          </p>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
              Triggered Risk Flags:
            </span>
            <div className="flex flex-wrap gap-1">
              {order.riskReasons?.map((r, i) => (
                <span key={i} className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-md">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-2">
          {callStage === 'connected' ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onVerifyOrder(order.id);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Cook</span>
              </button>

              <button
                onClick={() => {
                  onCancelOrder(order.id);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PhoneOff className="w-4 h-4 text-red-400" />
              <span>Hang Up Call</span>
            </button>
          )}

          {callStage === 'connected' && (
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-white pt-1 block mx-auto"
            >
              Dismiss call modal
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
