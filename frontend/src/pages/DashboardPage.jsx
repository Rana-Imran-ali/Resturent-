import React from 'react';
import RestaurantDashboardPanel from '../components/RestaurantDashboardPanel';

export default function DashboardPage() {
  return (
    <div className="w-full space-y-4">
      {/* Page Title & Context */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Restaurant Kitchen Operations Dashboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Full-width live pipeline synced with the AI Customer Chat & Voice agents.
        </p>
      </div>

      {/* Full Width Dashboard Panel */}
      <RestaurantDashboardPanel />
    </div>
  );
}
