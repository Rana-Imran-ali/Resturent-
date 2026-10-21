import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Bot, 
  Flame, 
  CreditCard,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export default function AnalyticsPage() {
  const { orders } = useApp();

  const validOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // Mocked peak hours distribution
  const PEAK_HOURS = [
    { time: '1:00 PM', count: 14, percent: 45, label: 'Lunch Rush' },
    { time: '3:00 PM', count: 6, percent: 20, label: 'Afternoon Slump' },
    { time: '7:00 PM', count: 22, percent: 70, label: 'Dinner Start' },
    { time: '9:00 PM', count: 35, percent: 95, label: 'Peak Rush' },
    { time: '11:00 PM', count: 28, percent: 80, label: 'Late Night' },
    { time: '1:00 AM', count: 18, percent: 55, label: 'Midnight Cravings' }
  ];

  // Best selling items leaderboard
  const TOP_SELLERS = [
    { name: 'Crispy Zinger Burger', category: 'Burgers', orders: 48, revenue: 'Rs. 24,960', progress: 95 },
    { name: 'Midnight Deal 1 (Zinger Combo)', category: 'Value Deals', orders: 36, revenue: 'Rs. 25,164', progress: 82 },
    { name: 'Chicken Fajita Pizza (Large)', category: 'Pizzas', orders: 24, revenue: 'Rs. 39,600', progress: 68 },
    { name: 'Loaded Peri Peri Fries', category: 'Sides', orders: 29, revenue: 'Rs. 13,050', progress: 62 },
    { name: 'Pepsi Regular Can (345ml)', category: 'Beverages', orders: 54, revenue: 'Rs. 4,860', progress: 50 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Kitchen Analytics & Performance
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time order throughput, peak hourly rushes, and item velocity generated from conversational AI data.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Sales Today</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium mt-1 block">● Real-time synced</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Orders Dispatched</span>
            <ShoppingBag className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {orders.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Total kitchen volume</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            Rs. {avgOrderValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Basket size in PKR</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>AI Automation Rate</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            94.2%
          </div>
          <span className="text-[10px] text-purple-400 font-medium mt-1 block">Without human escalation</span>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Chart 1: Peak Ordering Hours (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Peak Ordering Hours (Hourly Volume)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pakistan restaurant rush spikes around dinner (9:00 PM) and late-night cravings.
              </p>
            </div>
            <span className="text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-800 font-mono">
              24-Hour Cycle
            </span>
          </div>

          {/* Vertical Bar Visualizer */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {PEAK_HOURS.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.count}
                </span>
                
                {/* Visual Bar */}
                <div className="w-full max-w-[42px] bg-slate-950 rounded-xl overflow-hidden p-1 flex items-end h-full">
                  <div 
                    className="w-full bg-gradient-to-t from-orange-600 to-amber-400 rounded-lg transition-all duration-700 group-hover:from-orange-500 group-hover:to-amber-300 shadow-md shadow-orange-500/10"
                    style={{ height: `${bar.percent}%` }}
                  />
                </div>

                <div className="text-center mt-1">
                  <span className="text-[11px] font-bold text-white block">{bar.time}</span>
                  <span className="text-[9px] text-slate-500 truncate block max-w-[50px]">{bar.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Channel & Payment Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Channel & Payment Distribution</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live ratio of Voice vs Chat and Payment methods.
            </p>
          </div>

          <div className="space-y-4">
            {/* Payment Method Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Cash on Delivery (COD)</span>
                <span className="text-white font-bold">82%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '82%' }} />
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>COD (Pakistan Standard)</span>
                <span>Online / Mobile Wallet (18%)</span>
              </div>
            </div>

            {/* Ordering Channel Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">AI Voice Ordering</span>
                <span className="text-white font-bold">48%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }} />
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '52%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Voice STT (Web Speech): 48%</span>
                <span>Chat Messaging: 52%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Table: Best Selling Items Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Top Selling Menu Items & Velocity</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ranked by orders captured through the conversational ordering assistant.
            </p>
          </div>
          <span className="text-xs text-orange-400 font-semibold">Live Leaderboard</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {TOP_SELLERS.map((item, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-white text-[11px]">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <span className="text-[10px] text-slate-500">{item.category}</span>
                </div>
              </div>

              {/* Progress Bar & Stats */}
              <div className="flex items-center gap-4 sm:w-72 justify-between sm:justify-end">
                <div className="hidden sm:block w-32 h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">{item.orders} orders</span>
                  <span className="text-[10px] text-emerald-400 font-medium">{item.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
