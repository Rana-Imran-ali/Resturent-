import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { startVoiceRecognition, isSpeechRecognitionSupported } from '../services/speechService';
import { 
  Mic, 
  MicOff, 
  Send, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  User, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  Volume2
} from 'lucide-react';

export default function ChatOrdering() {
  const {
    messages,
    draftOrder,
    sendCustomerMessage,
    selectedCustomer,
    conversationStatus,
    isListening,
    setIsListening,
    isSpeaking,
    triggerManualHandoff,
    returnControlToAi
  } = useRestaurant();

  const [inputVal, setInputVal] = useState('');
  const [speechActive, setSpeechActive] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [expandedToolMsgId, setExpandedToolMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimSpeech]);

  // Handle Voice Recording toggle
  const toggleListening = () => {
    if (speechActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setSpeechActive(false);
      setIsListening(false);
      setInterimSpeech('');
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome/Edge or type your order.');
      return;
    }

    setSpeechActive(true);
    setIsListening(true);
    setInterimSpeech('Listening... (Boliye maslan: "2 zinger burger de do")');

    const rec = startVoiceRecognition({
      onResult: ({ transcript, isFinal }) => {
        setInterimSpeech(transcript);
        if (isFinal) {
          setInputVal(transcript);
          sendCustomerMessage(transcript);
          setInterimSpeech('');
          setSpeechActive(false);
          setIsListening(false);
        }
      },
      onEnd: () => {
        setSpeechActive(false);
        setIsListening(false);
        setInterimSpeech('');
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setSpeechActive(false);
        setIsListening(false);
        setInterimSpeech('');
      }
    });

    recognitionRef.current = rec;
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal;
    setInputVal('');
    sendCustomerMessage(text);
  };

  // Quick preset suggestions
  const quickPrompts = [
    { label: '🍔 2 Zinger + Pepsi', text: 'Bhai 2 zinger burger de do aur ek thanda pepsi' },
    { label: '⚡ Midnight Deal 1', text: 'Midnight Deal 1 kardo' },
    { label: '🍲 Chicken Karahi Half + 2 Naan', text: '1 Half Chicken Karahi aur 2 Roghni Naan bhej dein' },
    { label: '🍕 Fajita Pizza Med', text: '1 Medium Chicken Fajita Pizza with pan crust' },
    { label: '❌ Pepsi hata do', text: 'Pepsi hata do cart se' },
    { label: '✅ Haan Confirm hai', text: 'Haan theek hai, order confirm kar do' },
    { label: '👤 Manager se baat karao', text: 'Mujhe manager se baat karni hai' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner if Human Handoff is Active */}
      {conversationStatus === 'handed_off' && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-amber-300 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Human Staff Takeover Active:</strong> Chat is currently handed over to the restaurant manager.
            </span>
          </div>
          <button
            onClick={returnControlToAi}
            className="px-3 py-1 bg-amber-500 text-slate-950 font-semibold rounded-lg text-xs hover:bg-amber-400 transition-colors"
          >
            Hand back to AI
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chat Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[750px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Chat Stream Header */}
          <div className="px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md">
                  AI
                </div>
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <Volume2 className="w-2 h-2 text-white animate-pulse" />
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  Khaaba Ordering Agent
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h2>
                <p className="text-[11px] text-slate-400">
                  Multilingual Roman Urdu / Urdu / English AI Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerManualHandoff}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
              >
                Request Manager
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';
              const isStaff = msg.role === 'human_agent';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <div className="bg-slate-800/80 border border-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full text-center">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-tr-none'
                        : isStaff
                        ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-100 border border-purple-500/30 rounded-tl-none'
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    }`}
                  >
                    {/* Role Tag for Staff */}
                    {isStaff && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Restaurant Manager Takeover
                      </div>
                    )}

                    {/* Message Body */}
                    <p className="whitespace-pre-line text-sm">{msg.content}</p>

                    {/* Quick Confirmation Action Buttons if prompt asked for confirmation */}
                    {msg.needsConfirmation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2">
                        <button
                          onClick={() => sendCustomerMessage('Haan bhai confirm kar do, bhej do')}
                          className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Haan, Confirm Karein
                        </button>
                        <button
                          onClick={() => sendCustomerMessage('Nahi cancel kar do')}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-medium transition-colors"
                        >
                          Cancel Karein
                        </button>
                      </div>
                    )}

                    {/* Simulated LLM Tool Call Inspector for Supervisor/Examiner Demo */}
                    {msg.simulatedTool && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                        <button
                          onClick={() => setExpandedToolMsgId(expandedToolMsgId === msg.id ? null : msg.id)}
                          className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono hover:text-amber-300 transition-colors"
                        >
                          <Code2 className="w-3 h-3" />
                          <span>Tool Call: {msg.simulatedTool.name}()</span>
                          {expandedToolMsgId === msg.id ? (
                            <ChevronUp className="w-3 h-3 ml-auto" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-auto" />
                          )}
                        </button>

                        {expandedToolMsgId === msg.id && (
                          <div className="mt-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                            <span className="text-slate-400">// Structured LLM Tool Execution:</span>
                            <pre className="mt-1 text-slate-300">
                              {JSON.stringify(msg.simulatedTool, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 text-right mt-1.5 opacity-70">
                      {msg.createdAt}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Interim voice transcript live preview */}
            {interimSpeech && (
              <div className="flex justify-end">
                <div className="bg-orange-950/40 border border-orange-500/40 text-orange-200 text-xs px-3.5 py-2 rounded-xl rounded-tr-none italic animate-pulse">
                  🎙️ {interimSpeech}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 whitespace-nowrap text-xs">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-400" /> Quick:
              </span>
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendCustomerMessage(q.text)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-all"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat & Voice Input Dock */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 sm:gap-3">
            
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={speechActive ? 'Stop listening' : 'Start voice ordering (Roman Urdu / English)'}
              className={`relative p-3 rounded-xl flex items-center justify-center transition-all ${
                speechActive
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700'
              }`}
            >
              {speechActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {speechActive && (
                <span className="absolute inset-0 rounded-xl border-2 border-red-400 animate-ping" />
              )}
            </button>

            {/* Text Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  speechActive
                    ? 'Bolte rahiye, system transcript kar raha hai...'
                    : 'Bhai 2 zinger de do aur thanda pepsi... (Urdu/English)'
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-orange-500/20 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

        </div>

        {/* Right Column: Live Order Receipt & Customer Profile (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Customer Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-orange-400 border border-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">{selectedCustomer.name}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedCustomer.cancelCount >= 3 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedCustomer.badge}
              </span>
            </div>

            <div className="mt-2.5 text-xs text-slate-400 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span className="leading-tight">{draftOrder.address || selectedCustomer.address}</span>
            </div>
          </div>

          {/* Real-time Order Draft Receipt */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-white">Live Order Draft</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {draftOrder.items.length} {draftOrder.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Items in Draft List */}
            <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {draftOrder.items.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Cart abhi khaali hai.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Bol kar ya chat mein likh kar items add karein.
                  </p>
                </div>
              ) : (
                draftOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">🍔</div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-white">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-400">
                            Qty: <strong className="text-orange-400">{item.quantity}</strong>
                          </span>
                          {item.modifiers?.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-amber-300">
                              {item.modifiers.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white">
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Summary */}
            {draftOrder.items.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rs. {draftOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Charges</span>
                  <span>Rs. {draftOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Grand Total (COD)</span>
                  <span className="text-orange-400">Rs. {draftOrder.grandTotal}</span>
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={() => sendCustomerMessage('Haan order confirm hai, bhej do')}
                  className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Place Order (Live)
                </button>
              </div>
            )}
          </div>

          {/* Supervisor Guide Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              💡 FYP Demo Tips for Supervisor:
            </h4>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
              <li>Test Roman Urdu: <em>"bhai 2 zinger de do aur thanda sa pepsi"</em></li>
              <li>Test Voice STT/TTS: Click the 🎙️ mic icon to speak</li>
              <li>Test Correction: <em>"pepsi hata do"</em></li>
              <li>Test Human Takeover: <em>"manager se baat karao"</em></li>
              <li>Switch to <strong>Live Dashboard</strong> tab to view orders in real time</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
