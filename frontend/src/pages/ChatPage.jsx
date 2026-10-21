import React, { useState, useEffect } from 'react';
import CustomerPhonePanel from '../components/CustomerPhonePanel';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { 
  ShoppingBag, 
  Sparkles, 
  Brain, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Languages,
  Database,
  Zap,
  Search,
  BarChart3,
  RefreshCw,
  Globe,
  Server,
  Activity
} from 'lucide-react';

export default function ChatPage({ externalTriggerText, onClearExternalTrigger }) {
  const { cart, clearCart, placeOrder, activeCustomer, chatMessages } = useApp();

  // RAG State from the CustomerPhonePanel (via custom event)
  const [ragResult, setRagResult] = useState(null);
  const [ragStatus, setRagStatus] = useState(null);
  const [ragStatusLoading, setRagStatusLoading] = useState(false);

  // Listen for RAG result updates from CustomerPhonePanel
  useEffect(() => {
    const handler = (e) => setRagResult(e.detail);
    window.addEventListener('ragResultUpdate', handler);
    return () => window.removeEventListener('ragResultUpdate', handler);
  }, []);

  // Fetch RAG vector store status on mount
  useEffect(() => {
    fetchRagStatus();
  }, []);

  const fetchRagStatus = async () => {
    setRagStatusLoading(true);
    try {
      const status = await api.chat.getRagStatus();
      setRagStatus(status);
    } catch (err) {
      console.warn('RAG status fetch note:', err?.message);
      setRagStatus({ vector_count: '—', dimensions: 64, embedding_type: 'Offline' });
    } finally {
      setRagStatusLoading(false);
    }
  };

  const handleReindex = async () => {
    setRagStatusLoading(true);
    try {
      await api.chat.reindexRag();
      await fetchRagStatus();
    } catch (err) {
      console.warn('Reindex error:', err?.message);
    } finally {
      setRagStatusLoading(false);
    }
  };

  // Inspect the latest messages to explain what the AI understood
  const lastUserMessage = [...chatMessages].reverse().find(m => m.sender === 'user');

  // Language label
  const detectedLanguage = ragResult?.detected_language 
    ? ragResult.detected_language === 'roman_urdu' ? 'Roman Urdu'
      : ragResult.detected_language === 'urdu_script' ? 'Urdu Script (اردو)'
      : ragResult.detected_language === 'local' ? 'Local Engine'
      : 'English'
    : lastUserMessage?.text
      ? /[\u0600-\u06FF]/.test(lastUserMessage.text)
        ? 'Urdu Script (اردو)'
        : /\b(bhai|de do|kardo|chahye|thanda|aur|pepsi|nahi|haan)\b/i.test(lastUserMessage.text)
        ? 'Roman Urdu'
        : 'English'
      : 'Awaiting input';

  // Source label
  const sourceType = ragResult?.source === 'rag_backend' 
    ? 'Vector Database (RAG)' 
    : ragResult?.source === 'local_engine' 
    ? 'Local Cart Engine' 
    : 'Awaiting query';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          AI Chat Ordering <span className="text-cyan-400">+ Vector RAG</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customer chat connected to Vector Database for grounded answers. Supports Roman Urdu, Urdu script, and English.
        </p>
      </div>

      {/* Main Grid: Centered Phone Frame + Side Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Customer Phone Mockup Frame (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <CustomerPhonePanel
            externalTriggerText={externalTriggerText}
            onClearExternalTrigger={onClearExternalTrigger}
          />
        </div>

        {/* Right: RAG Intelligence Panel + Live Cart (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Card 0: Vector Database Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Vector Database Status</h3>
                  <span className="text-[10px] text-slate-400">RAG Knowledge Store</span>
                </div>
              </div>
              <button
                onClick={handleReindex}
                disabled={ragStatusLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
                title="Re-index all menu items and policies into the vector store"
              >
                <RefreshCw className={`w-3 h-3 ${ragStatusLoading ? 'animate-spin' : ''}`} />
                <span>Reindex</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-black text-cyan-400">
                  {ragStatus?.vector_count ?? '—'}
                </div>
                <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mt-0.5">Vectors</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-black text-amber-400">
                  {ragStatus?.dimensions ?? 64}
                </div>
                <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mt-0.5">Dimensions</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-center">
                <div className="text-lg font-black text-emerald-400">
                  <Activity className="w-5 h-5 mx-auto" />
                </div>
                <div className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mt-0.5">Cosine Sim</div>
              </div>
            </div>

            {ragStatus?.sample_titles?.length > 0 && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Indexed Documents (Sample):
                </span>
                <div className="space-y-0.5">
                  {ragStatus.sample_titles.slice(0, 4).map((title, i) => (
                    <div key={i} className="flex items-center gap-1 text-[10px] text-slate-300">
                      <Database className="w-2.5 h-2.5 text-cyan-400/60" />
                      <span className="truncate">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 1: What the AI Understood (Live NLP + RAG Inspector) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">RAG Intelligence Inspector</h3>
                <span className="text-[10px] text-slate-400">Live Agent Parsing + Vector Retrieval</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Language Detected */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-orange-400" />
                  <span>Detected Language:</span>
                </span>
                <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                  {detectedLanguage}
                </span>
              </div>

              {/* Response Source */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Response Source:</span>
                </span>
                <span className={`font-semibold px-2 py-0.5 rounded-md border ${
                  ragResult?.source === 'rag_backend' 
                    ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' 
                    : ragResult?.source === 'local_engine'
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                    : 'text-slate-400 bg-slate-900 border-slate-800'
                }`}>
                  {sourceType}
                </span>
              </div>

              {/* Latest Parsed Customer Intent */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Last Customer Input:
                </span>
                <p className="text-slate-200 font-mono text-[11px] italic">
                  "{ragResult?.query || lastUserMessage?.text || 'Awaiting customer message...'}"
                </p>
              </div>

              {/* RAG Retrieved Sources */}
              {ragResult?.retrieved_sources?.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Vector Search Results ({ragResult.retrieved_sources.length} retrieved):
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {ragResult.retrieved_sources.map((src, i) => (
                      <div key={i} className="bg-slate-900/50 p-2 rounded-xl border border-slate-800/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span className="text-[11px] font-bold text-white truncate max-w-[160px]">{src.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-bold text-cyan-400">{src.similarity_percent}%</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                          {src.content?.substring(0, 120)}...
                        </p>
                        <div className="flex items-center gap-2 text-[9px]">
                          <span className="text-slate-500">Type: <span className="text-slate-300">{src.document_type}</span></span>
                          {src.metadata?.price && (
                            <span className="text-slate-500">Price: <span className="text-emerald-400">Rs. {src.metadata.price}</span></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No RAG sources fallback */}
              {ragResult && ragResult.source === 'rag_backend' && ragResult.retrieved_sources?.length === 0 && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/20 text-[11px] text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>No exact vector matches found. Response generated from general knowledge base.</span>
                </div>
              )}

              {/* RAG Context Used */}
              {ragResult?.context_used && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Context Provided to Generator:
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono max-h-24 overflow-y-auto pr-1">
                    {ragResult.context_used || '—'}
                  </p>
                </div>
              )}

              {/* Extracted Items (if any) */}
              {ragResult?.extracted_items?.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/20 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Items Extracted from Query:
                  </span>
                  {ragResult.extracted_items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-white font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-emerald-400 font-bold">Rs. {item.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Menu Grounding Status */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Grounding Strategy:
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  All answers are grounded in <code className="text-cyan-400">vector_knowledge_bases</code> table via cosine similarity search. Out-of-menu items rejected automatically.
                </p>
              </div>

              {/* Customer Delivery Context */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span className="truncate">{activeCustomer.address}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <CreditCard className="w-3 h-3 text-slate-500" />
                  <span>Cash on Delivery (COD)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Cart Summary Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Cart Summary</h3>
                  <span className="text-[10px] text-slate-400">{cart.items.length} unique item(s)</span>
                </div>
              </div>

              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  title="Empty Cart"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Clear</span>
                </button>
              )}
            </div>

            {cart.items.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                Cart is currently empty. Ask the AI agent in the chat to add items!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-slate-800/80 max-h-48 overflow-y-auto pr-1">
                  {cart.items.map(it => (
                    <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-orange-400">{it.quantity}x</span>
                          <span className="font-medium text-white">{it.name}</span>
                        </div>
                        {it.modifiers?.length > 0 && (
                          <span className="text-[10px] text-slate-500">
                            ({it.modifiers.join(', ')})
                          </span>
                        )}
                      </div>
                      <span className="text-slate-300 font-semibold">
                        Rs. {(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Grand Total */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>Rs. {cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee</span>
                    <span>Rs. {cart.deliveryFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                    <span>Grand Total</span>
                    <span className="text-emerald-400">Rs. {cart.grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => placeOrder()}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <span>Dispatch Direct to Kitchen</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
