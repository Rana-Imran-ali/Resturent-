import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Send, 
  User, 
  Bot, 
  ShieldAlert, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function HumanHandoffModal({ isOpen, onClose, attentionItem }) {
  const {
    chatMessages,
    addChatMessage,
    activeCustomer,
    resolveAttention
  } = useApp();

  const [staffInput, setStaffInput] = useState('');

  if (!isOpen) return null;

  const currentCustomer = attentionItem?.customer || activeCustomer;

  const handleSend = (e) => {
    e.preventDefault();
    if (!staffInput.trim()) return;

    addChatMessage({
      sender: 'manager',
      text: `[Restaurant Manager]: ${staffInput}`
    });

    setStaffInput('');
  };

  const handleResolveAndClose = () => {
    if (attentionItem?.id) {
      resolveAttention(attentionItem.id);
    }
    addChatMessage({
      sender: 'agent',
      text: '🤖 Conversation handoff resolved. Control returned to AI Ordering Assistant.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Live Customer Takeover Desk</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">
                  Manager Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer: <strong>{currentCustomer?.name}</strong> ({currentCustomer?.phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResolveAndClose}
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolve & Hand back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Handoff Reason Alert Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-5 py-2.5 flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Reason: <strong>{attentionItem?.reason || 'Customer requested manager intervention'}</strong>
          </span>
        </div>

        {/* Live Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
          {chatMessages.map((m) => {
            const isUser = m.sender === 'user';
            const isManager = m.sender === 'manager';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                  {isUser ? (
                    <>Customer ({currentCustomer?.name}) <User className="w-2.5 h-2.5" /></>
                  ) : isManager ? (
                    <>You (Store Manager) <ShieldAlert className="w-2.5 h-2.5 text-purple-400" /></>
                  ) : (
                    <>AI Ordering Agent <Bot className="w-2.5 h-2.5 text-orange-400" /></>
                  )}
                  <span className="text-[9px] text-slate-500 ml-1">{m.time}</span>
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : isManager
                      ? 'bg-purple-900/90 border border-purple-500/40 text-purple-100 rounded-tl-none font-medium'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff Reply Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={staffInput}
            onChange={(e) => setStaffInput(e.target.value)}
            placeholder="Type live manager reply directly to the customer..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!staffInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send as Manager</span>
          </button>
        </form>

      </div>
    </div>
  );
}
