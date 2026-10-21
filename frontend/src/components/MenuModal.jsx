import React, { useState } from 'react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menuData';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  UtensilsCrossed, 
  Search, 
  Sparkles, 
  Plus, 
  Check, 
  Tag 
} from 'lucide-react';

export default function MenuModal() {
  const { sendCustomerMessage, setActiveTab } = useRestaurant();
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemName, setAddedItemName] = useState(null);

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCat = selectedCat === 'all' || item.categoryId === selectedCat;
    const matchesQuery = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameUr?.includes(searchQuery) ||
      item.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleOrderDirectly = (item) => {
    setAddedItemName(item.name);
    setTimeout(() => setAddedItemName(null), 1800);
    sendCustomerMessage(`Bhai 1 ${item.name} add kar do`);
    setActiveTab('customer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Pakistani Restaurant Real Menu</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {MENU_ITEMS.length} Items & Deals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded database for the AI Agent. Includes Roman Urdu aliases, Urdu names, and modifiers.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 'zinger', 'karahi', 'pizza'..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedCat === 'all'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Items ({MENU_ITEMS.length})
        </button>
        {MENU_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCat === cat.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all group"
          >
            <div>
              {/* Item Thumbnail */}
              <div className="h-44 w-full bg-slate-950 relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-bold text-orange-400">
                  Rs. {item.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    {item.nameUr && (
                      <p className="text-xs text-orange-300 font-serif" dir="rtl">
                        {item.nameUr}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Included Items for Deals */}
                {item.includedItems && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-orange-400">Includes:</span>
                    {item.includedItems.map((inc, i) => (
                      <div key={i} className="text-slate-400">
                        • {inc.qty}x {inc.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Roman Urdu Recognition Aliases */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> AI Recognizes Keywords:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.aliases.slice(0, 4).map((alias, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        "{alias}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Order Button */}
            <div className="p-4 pt-0">
              <button
                onClick={() => handleOrderDirectly(item)}
                className="w-full py-2 bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                {addedItemName === item.name ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Sent to AI Chat!
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Order via AI Chat
                  </>
                )}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
