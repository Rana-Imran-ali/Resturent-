import React from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_CUSTOMERS } from '../data/customers';
import { 
  RotateCcw, 
  Smartphone, 
  Store, 
  Sparkles, 
  Users,
  ShieldAlert,
  Play
} from 'lucide-react';

export default function TopBar({ 
  activeMobileTab, 
  setActiveMobileTab, 
  onOpenDemoMode, 
  onOpenRoadmap 
}) {
  const { 
    resetDemo, 
    activeCustomer, 
    setActiveCustomer, 
    conversationsNeedingAttention,
    orders 
  } = useApp();

  const pendingCount = orders.filter(o => o.status === 'New' || o.status === 'Preparing').length;
  const attentionCount = conversationsNeedingAttention.length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand / Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
              🥘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Dastarkhwan AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  FYP Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Urdu & Roman Urdu AI Voice Ordering + Live Restaurant Dashboard
              </p>
            </div>
          </div>

          {/* Mobile Right Controls: Demo Mode + Reset */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenDemoMode}
              className="p-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold shadow-md"
              title="Run Auto-play Demo"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            <button
              onClick={resetDemo}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700"
              title="Reset Demo State"
            >
              <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>
        </div>

        {/* Small Screen Tab Switcher */}
        <div className="flex lg:hidden w-full bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMobileTab('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMobileTab === 'customer'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Customer View</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('restaurant')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all relative ${
              activeMobileTab === 'restaurant'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Restaurant Dashboard</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {pendingCount}
              </span>
            )}
            {attentionCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-2" />
            )}
          </button>
        </div>

        {/* Desktop Controls: Persona Switcher + Demo Mode + Future Features + Reset Demo */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Persona selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Persona:</span>
            <select
              value={activeCustomer.id}
              onChange={(e) => {
                const found = DEMO_CUSTOMERS.find(c => c.id === e.target.value);
                if (found) setActiveCustomer(found);
              }}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {DEMO_CUSTOMERS.map(cust => (
                <option key={cust.id} value={cust.id} className="bg-slate-900 text-white">
                  {cust.name} ({cust.tag})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-play Demo Mode Button */}
          <button
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            title="Auto-play 5-step scripted conversation for presentation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Demo Mode</span>
          </button>

          {/* Future Roadmap Drawer Button */}
          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
            title="View Planned Production Features"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Future Roadmap</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all shadow-sm active:scale-95"
            title="Reset All State to Seed"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span>Reset</span>
          </button>
        </div>

      </div>
    </header>
  );
}
