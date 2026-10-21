import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { DEMO_CUSTOMERS } from '../data/mockCustomers';
import { 
  Bot, 
  LayoutDashboard, 
  UtensilsCrossed, 
  Volume2, 
  VolumeX, 
  User, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    selectedCustomer,
    setSelectedCustomer,
    isTtsMuted,
    setIsTtsMuted,
    liveOrders,
    conversationStatus,
    resetOrderingSession
  } = useRestaurant();

  const pendingOrdersCount = liveOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Khaaba AI</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Voice & Chat Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Urdu / Roman Urdu AI Ordering Agent for Pakistani Restaurants
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'customer'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Customer Chat & Voice</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'dashboard'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Live Dashboard</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
              {conversationStatus === 'handed_off' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'menu'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu Explorer</span>
            </button>
          </div>

          {/* Persona Switcher & Voice Mute */}
          <div className="flex items-center gap-3">
            {/* Customer Persona Selector */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-slate-400">Persona:</span>
              <select
                value={selectedCustomer.id}
                onChange={(e) => {
                  const cust = DEMO_CUSTOMERS.find(c => c.id === e.target.value);
                  if (cust) setSelectedCustomer(cust);
                }}
                className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
              >
                {DEMO_CUSTOMERS.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* TTS Mute Toggle */}
            <button
              onClick={() => setIsTtsMuted(!isTtsMuted)}
              title={isTtsMuted ? "Audio speech is muted (click to un-mute)" : "Voice speech is ON (click to mute)"}
              className={`p-2 rounded-lg border transition-all ${
                isTtsMuted 
                  ? 'bg-slate-800 border-slate-700 text-slate-500' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isTtsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Reset Session button */}
            <button
              onClick={resetOrderingSession}
              title="Reset current chat and start new order session"
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
