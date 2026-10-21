import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateOrderRisk } from '../utils/riskScorer';
import { 
  MessageSquare, 
  LayoutDashboard, 
  ShieldAlert, 
  UtensilsCrossed, 
  ShieldCheck, 
  BarChart3, 
  Sparkles,
  X,
  Store,
  ChevronRight,
  User,
  Shield,
  LogIn,
  LogOut,
  Truck
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Customer Experience',
    links: [
      { to: '/menu', label: 'Food Menu', icon: UtensilsCrossed, description: 'Browse dishes & add to cart' },
      { to: '/chat', label: 'AI Order Chatbot', icon: MessageSquare, description: 'Urdu & Roman Urdu agent' },
      { to: '/customer', label: 'My Orders & Account', icon: User, description: 'Track orders & history' },
    ]
  },
  {
    title: 'Restaurant Operations',
    links: [
      { to: '/dashboard', label: 'Kitchen Kanban', icon: LayoutDashboard, badgeKey: 'orders' },
      { to: '/handoff', label: 'Human Handoff', icon: ShieldAlert, badgeKey: 'attention' },
      { to: '/risk', label: 'Risk & Fraud Check', icon: ShieldCheck, badgeKey: 'highRisk' },
      { to: '/analytics', label: 'Kitchen Analytics', icon: BarChart3 },
      { to: '/roadmap', label: 'Future Features', icon: Sparkles }
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const { 
    orders, 
    conversationsNeedingAttention, 
    menu, 
    currentUser, 
    isAdmin, 
    setAuthModalOpen, 
    logout 
  } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'New' || o.status === 'Preparing').length;
  const attentionCount = conversationsNeedingAttention.length;
  const soldOutCount = menu.filter(i => !i.available).length;
  const highRiskCount = orders.filter(o => calculateOrderRisk(o).level === 'High' && o.status !== 'Delivered').length;

  const getBadge = (key) => {
    if (key === 'orders' && pendingOrdersCount > 0) {
      return { text: pendingOrdersCount, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (key === 'attention' && attentionCount > 0) {
      return { text: attentionCount, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse' };
    }
    if (key === 'soldOut' && soldOutCount > 0) {
      return { text: `${soldOutCount} 86'd`, color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    if (key === 'highRisk' && highRiskCount > 0) {
      return { text: highRiskCount, color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' };
    }
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity" 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-lg">
              🥘
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">Dastarkhwan AI</span>
              </div>
              <span className="text-[10px] text-orange-400 font-medium">Restaurant Suite</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {section.title}
              </h4>
              
              {section.links.map((link) => {
                const IconComponent = link.icon;
                const badge = link.badgeKey ? getBadge(link.badgeKey) : null;

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all group ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 shrink-0 transition-colors" />
                      <span>{link.label}</span>
                    </div>

                    {badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${badge.color}`}>
                        {badge.text}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: User Role & Auth Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 space-y-2">
          {currentUser ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white text-xs truncate block">{currentUser.name}</span>
                    <span className={`text-[10px] font-semibold uppercase ${isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  title="Switch User / Persona"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-400" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Backend Connected
            </span>
            <span className="font-mono text-slate-400">Laravel API</span>
          </div>
        </div>

      </aside>
    </>
  );
}
