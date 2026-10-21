import React from 'react';
import { 
  PhoneCall, 
  MessageCircle, 
  CreditCard, 
  BarChart3, 
  GitFork, 
  Sparkles, 
  CheckCircle2,
  Rocket,
  Clock,
  Wifi
} from 'lucide-react';

const ROADMAP_ITEMS = [
  {
    id: 'telephony',
    phase: 6,
    title: 'Real Telephony & Phone Line Ingestion',
    category: 'Voice AI Infrastructure',
    status: 'Planned',
    icon: PhoneCall,
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    description: 'Connect Pakistan landlines and mobile hotlines using Twilio / Exotel SIP trunking. Real-time streaming voice AI answers customer phone calls 24/7 without hold times.',
    highlights: ['Zero hold time during peak rush', 'Deepgram Urdu STT + ElevenLabs TTS', 'Simultaneous 100+ concurrent calls'],
    eta: 'Q2 2025'
  },
  {
    id: 'whatsapp',
    phase: 7,
    title: 'Official WhatsApp Cloud API Bot',
    category: 'Omnichannel Commerce',
    status: 'Planned',
    icon: MessageCircle,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    description: 'Direct conversational ordering on WhatsApp with interactive list menus, order tracking, and live GPS location pin drop for accurate doorstep deliveries.',
    highlights: ['Interactive catalog menus', 'Automatic live order status updates', 'Location pin-drop address capture'],
    eta: 'Q3 2025'
  },
  {
    id: 'payments',
    phase: 8,
    title: 'Pakistani Digital Payments (JazzCash & Easypaisa)',
    category: 'Fintech & Settlement',
    status: 'Planned',
    icon: CreditCard,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    description: '1-Click instant mobile wallet payments to drastically reduce Cash-on-Delivery (COD) refusal and cancellation risks at the doorstep.',
    highlights: ['JazzCash & Easypaisa mobile wallet prompt', 'Raast Instant P2M QR scanning', 'Visa / Mastercard card tokenization'],
    eta: 'Q3 2025'
  },
  {
    id: 'analytics_prod',
    phase: 9,
    title: 'Kitchen Analytics & Demand Forecasting',
    category: 'Operational Intelligence',
    status: 'In Design',
    icon: BarChart3,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    description: 'AI intelligence calculating dish cooking times, peak ordering hours, wastage forecasts, and repeat customer retention metrics using historical order data.',
    highlights: ['Dish velocity & preparation speed tracking', 'Peak demand surges prediction', 'Customer lifetime value & churn warning'],
    eta: 'Q4 2025'
  },
  {
    id: 'multi_branch',
    phase: 10,
    title: 'Multi-Branch Routing & POS Synchronization',
    category: 'Enterprise Scale',
    status: 'Research',
    icon: GitFork,
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    description: 'Intelligent order geo-routing to the closest branch kitchen with bidirectional synchronization into Pakistani POS systems (Foodnerd, Tossdown, Retailer).',
    highlights: ['Radius-based kitchen auto-dispatch', 'Kitchen Display System (KDS) integration', 'Centralized cross-branch inventory sync'],
    eta: 'Q1 2026'
  }
];

const STATUS_STYLES = {
  'Planned':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In Design': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Research':  'bg-slate-800 text-slate-400 border-slate-700'
};

export default function RoadmapPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Future Production Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Planned commercial extensions for Pakistani restaurant chains. Beyond the FYP prototype.
          </p>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 self-start sm:self-auto">
          FYP to Production Plan
        </span>
      </div>

      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl shrink-0">
          🥘
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Phase 1–5 Complete: Dastarkhwan AI Prototype</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">LIVE FYP DEMO</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Text chat + voice ordering in Roman Urdu / Urdu / English mix, live Kanban dashboard, human handoff, 
            COD fraud risk scoring, analytics, and auto-play demo mode — all frontend-only, no backend required.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>Phase 5/5</span>
        </div>
      </div>

      <div className="space-y-4">
        {ROADMAP_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl transition-all group"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 sm:w-72">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${item.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Phase {item.phase} · {item.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-orange-300 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${STATUS_STYLES[item.status]}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.eta}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>{h}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-dashed border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
        <Rocket className="w-4 h-4 text-orange-400 mx-auto mb-2" />
        This roadmap is part of the university FYP proposal and shows the commercial viability path beyond the demo prototype.
      </div>
    </div>
  );
}
