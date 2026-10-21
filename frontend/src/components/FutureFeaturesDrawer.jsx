import React from 'react';
import { 
  X, 
  PhoneCall, 
  MessageCircle, 
  CreditCard, 
  BarChart3, 
  GitFork, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const ROADMAP_ITEMS = [
  {
    id: 'telephony',
    title: 'Real Telephony & Phone Line Ingestion',
    category: 'Voice AI Infrastructure',
    icon: PhoneCall,
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Connect Pakistan landlines and mobile hotlines using Twilio / Exotel SIP trunking. Real-time streaming voice AI answers customer phone calls 24/7 without hold times.',
    highlights: ['Zero hold time during peak rush', 'Deepgram Urdu STT + ElevenLabs TTS', 'Simultaneous 100+ concurrent calls']
  },
  {
    id: 'whatsapp',
    title: 'Official WhatsApp Cloud API Bot',
    category: 'Omnichannel Commerce',
    icon: MessageCircle,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Direct conversational ordering on WhatsApp with interactive list menus, order tracking, and live GPS location pin drop for accurate doorstep deliveries.',
    highlights: ['Interactive catalog menus', 'Automatic live order status updates', 'Location pin-drop address capture']
  },
  {
    id: 'payments',
    title: 'Pakistani Digital Payments (JazzCash & Easypaisa)',
    category: 'Fintech & Settlement',
    icon: CreditCard,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: '1-Click instant mobile wallet payments to drastically reduce Cash-on-Delivery (COD) refusal and cancellation risks.',
    highlights: ['JazzCash & Easypaisa mobile wallet prompt', 'Raast Instant P2M QR scanning', 'Visa / Mastercard card tokenization']
  },
  {
    id: 'analytics',
    title: 'Kitchen Analytics & Demand Forecasting',
    category: 'Operational Intelligence',
    icon: BarChart3,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'AI intelligence calculating dish cooking times, peak ordering hours, wastage forecasts, and repeat customer retention metrics.',
    highlights: ['Dish velocity & preparation speed tracking', 'Peak demand surges prediction', 'Customer lifetime value & churn warning']
  },
  {
    id: 'multi_branch',
    title: 'Multi-Branch Routing & POS Synchronization',
    category: 'Enterprise Scale',
    icon: GitFork,
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    description: 'Intelligent order geo-routing to the closest branch kitchen with bidirectional synchronization into Pakistani POS systems (Foodnerd, Tossdown, Retailer).',
    highlights: ['Radius-based kitchen auto-dispatch', 'Kitchen Display System (KDS) integration', 'Centralized cross-branch inventory sync']
  }
];

export default function FutureFeaturesDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Future Production Roadmap</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Next Milestone
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Planned commercial extensions for Pakistani restaurant chains
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {ROADMAP_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;

            return (
              <div 
                key={item.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 hover:border-slate-700 transition-colors shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.iconColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Phase {idx + 6}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5">{item.title}</h4>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-12">
                  {item.description}
                </p>

                {/* Feature Highlights */}
                <div className="pl-12 pt-1 flex flex-wrap gap-1.5">
                  {item.highlights.map((h, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Prepared for University Final Year Project (FYP)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all shadow-md shadow-orange-500/20"
          >
            Close Roadmap
          </button>
        </div>

      </div>
    </div>
  );
}
