import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

import Sidebar from './components/Sidebar';
import DemoModeModal from './components/DemoModeModal';
import FloatingVoiceChat from './components/FloatingVoiceChat';
import AuthModal from './components/AuthModal';
import OrderTrackingModal from './components/OrderTrackingModal';

// Pages
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import HandoffPage from './pages/HandoffPage';
import MenuPage from './pages/MenuPage';
import RiskPage from './pages/RiskPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RoadmapPage from './pages/RoadmapPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';

import { DEMO_CUSTOMERS } from './data/customers';
import {
  RotateCcw,
  Sparkles,
  Users,
  Play,
  Menu as MenuIcon,
  ShieldAlert,
  User,
  Shield,
  LogIn,
  Truck,
  Compass
} from 'lucide-react';

// ─── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar({ onOpenDemoMode, onOpenRoadmap, onToggleSidebar, onOpenTrackModal }) {
  const {
    resetDemo,
    activeCustomer,
    setActiveCustomer,
    conversationsNeedingAttention,
    orders,
    currentUser,
    isAdmin,
    setAuthModalOpen
  } = useApp();

  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'New' || o.status === 'Preparing').length;
  const attentionCount = conversationsNeedingAttention.length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 lg:pl-4">
      <div className="flex items-center justify-between gap-3">

        {/* Left: Hamburger (mobile) + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle sidebar"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-lg">
              🥘
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Dastarkhwan AI</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Smart Food Ordering &amp; Live Kitchen Management System
              </p>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Attention badge (mobile shortcut) */}
          {attentionCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse sm:hidden">
              <ShieldAlert className="w-3 h-3" />
              {attentionCount}
            </span>
          )}

          {/* Live Order Tracker Trigger */}
          <button
            onClick={onOpenTrackModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all active:scale-95"
            title="Track any order by order number"
          >
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Track Order</span>
          </button>

          {/* Role & Auth Switcher */}
          <button
            onClick={() => setAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
              isAdmin
                ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
            title="Click to switch between Customer and Admin accounts"
          >
            {isAdmin ? <Shield className="w-3.5 h-3.5 text-purple-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{currentUser?.name || (isAdmin ? 'Admin' : 'Customer')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 font-bold uppercase">
              {currentUser?.role || 'Guest'}
            </span>
          </button>

          {/* Persona selector for demo */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Persona:</span>
            <select
              value={activeCustomer.id}
              onChange={(e) => {
                const found = DEMO_CUSTOMERS.find(c => c.id === e.target.value);
                if (found) setActiveCustomer(found);
              }}
              className="bg-transparent text-[11px] text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              {DEMO_CUSTOMERS.map(cust => (
                <option key={cust.id} value={cust.id} className="bg-slate-900 text-white">
                  {cust.name} ({cust.tag})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-play Demo Mode */}
          <button
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
            title="Auto-play scripted demo conversation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Demo Mode</span>
          </button>

          {/* Reset System State */}
          <button
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all active:scale-95"
            title="Reset system state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
function RootLayout() {
  const { authModalOpen, setAuthModalOpen, openOrderTracker } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoTriggerText, setDemoTriggerText] = useState('');
  const [trackModalOpen, setTrackModalOpen] = useState(false);

  const handleExecuteDemoStep = (text) => {
    setDemoTriggerText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-orange-500 selection:text-white">

      {/* Persistent Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right Column */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <TopBar
          onOpenDemoMode={() => setIsDemoModalOpen(true)}
          onOpenRoadmap={() => window.location.assign('/roadmap')}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenTrackModal={() => setTrackModalOpen(true)}
        />

        {/* Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/chat" element={
              <ChatPage
                externalTriggerText={demoTriggerText}
                onClearExternalTrigger={() => setDemoTriggerText('')}
              />
            } />
            <Route path="/customer" element={<CustomerDashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/handoff" element={<HandoffPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/voice" element={<Navigate to="/menu" replace />} />
          </Routes>
        </main>
      </div>

      {/* Auto-play Demo Mode Modal */}
      <DemoModeModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onExecuteStep={handleExecuteDemoStep}
      />

      {/* Auth Modal (Login / Register / Fast Persona Switcher) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Global Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      {/* Floating Voice + Chat Agent Button */}
      <FloatingVoiceChat />
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <RootLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
