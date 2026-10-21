import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import HumanHandoffModal from '../components/HumanHandoffModal';
import { 
  ShieldAlert, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  MessageSquare, 
  Phone, 
  Clock, 
  User, 
  Bot,
  Send,
  Sparkles
} from 'lucide-react';

export default function HandoffPage() {
  const { 
    conversationsNeedingAttention, 
    flagConversationForAttention,
    resolveAttention,
    activeCustomer,
    chatMessages,
    addChatMessage
  } = useApp();

  const [selectedAttentionItem, setSelectedAttentionItem] = useState(null);
  const [managerReply, setManagerReply] = useState('');

  // Manual test trigger button
  const handleSimulateHandoff = () => {
    flagConversationForAttention('Customer sentiment alert: "Bhai manager se baat karni hai, order late hai"');
  };

  const handleSendManagerReply = (e) => {
    e.preventDefault();
    if (!managerReply.trim()) return;

    addChatMessage({
      sender: 'manager',
      text: `[Store Manager]: ${managerReply}`
    });
    setManagerReply('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Human Handoff & Attention Desk</span>
            {conversationsNeedingAttention.length > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                {conversationsNeedingAttention.length} Urgent
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time escalation desk for customer frustration, angry sentiment, or AI misunderstanding.
          </p>
        </div>

        <button
          onClick={handleSimulateHandoff}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors self-start sm:self-auto flex items-center gap-1.5"
          title="Simulate a customer escalation to test takeover"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Escalation</span>
        </button>
      </div>

      {/* Main Content Area */}
      {conversationsNeedingAttention.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            🛡️
          </div>
          <div>
            <h3 className="text-base font-bold text-white">All Conversations Running Smoothly</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              No customers currently require human manager takeover. The AI agent is handling all active orders and inquiries independently.
            </p>
          </div>
          <button
            onClick={handleSimulateHandoff}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all inline-flex items-center gap-1.5"
          >
            <span>Trigger Test Takeover Request</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List of Escalated Conversations (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Active Escalations ({conversationsNeedingAttention.length})
            </span>

            {conversationsNeedingAttention.map((attn) => (
              <div 
                key={attn.id}
                className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-xl hover:border-amber-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                    <span className="font-bold text-white text-sm">{attn.customer?.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {attn.flaggedAt}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    Escalation Reason:
                  </span>
                  <p className="text-slate-200 font-medium">
                    {attn.reason}
                  </p>
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{attn.customer?.phone}</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    {attn.customer?.tag || 'Customer'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedAttentionItem(attn)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Take Over in Modal</span>
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

          {/* Right Column: Live Takeover Stream Panel (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Conversation Terminal</h3>
                  <span className="text-[10px] text-slate-400">Communicating as Restaurant Manager</span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Staff Intercept Active
              </span>
            </div>

            {/* Conversation Log Stream */}
            <div className="h-80 overflow-y-auto space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
              {chatMessages.map((m) => {
                const isUser = m.sender === 'user';
                const isManager = m.sender === 'manager';

                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-0.5 px-1">
                      {isUser ? `${activeCustomer.name} (Customer)` : isManager ? 'You (Store Manager)' : 'AI Agent'} • {m.time}
                    </span>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-orange-500 text-white rounded-tr-none'
                        : isManager
                        ? 'bg-purple-900 border border-purple-500/40 text-purple-100 rounded-tl-none font-medium'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manager Direct Reply Input */}
            <form onSubmit={handleSendManagerReply} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={managerReply}
                onChange={(e) => setManagerReply(e.target.value)}
                placeholder="Type direct response to customer as Restaurant Manager..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!managerReply.trim()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Human Handoff Takeover Modal */}
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
