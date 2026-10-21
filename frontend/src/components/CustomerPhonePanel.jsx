import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { processAgentMessage } from '../services/agentEngine';
import api from '../services/api';
import { 
  startVoiceRecognition, 
  speakText, 
  stopSpeaking, 
  isSpeechRecognitionSupported 
} from '../services/speechService';
import { 
  Send, 
  Mic, 
  MicOff,
  ShoppingBag, 
  Sparkles, 
  MapPin, 
  Phone, 
  ChevronRight,
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  Trash2,
  UserCheck,
  Bot,
  AlertCircle,
  Volume2,
  VolumeX,
  Languages,
  Square,
  Edit3,
  Database,
  Truck,
  Zap
} from 'lucide-react';

/**
 * Determine whether the user message is a knowledge/FAQ question
 * that should be routed to the backend RAG system, or an ordering/cart
 * action that should be handled locally by the agent engine.
 */
function shouldUseRag(text, agentState, cart) {
  const norm = text.toLowerCase().trim();

  // ── Always handle locally (cart/order/checkout/handoff flows) ──
  // If waiting for order confirmation
  if (agentState.waitingForConfirmation || agentState.waitingForAddress) return false;
  // If user is confirming/declining
  if (/\b(haan|yes|ji|confirm|theek|kardo|kar do|done|nahi|no|cancel|ruko|stop)\b/i.test(norm)) return false;
  // If user is angry or requesting handoff
  if (/\b(bakwas|ghussa|stupid|idiot|worst|fraud|complaint|human|manager|representative|agent se baat)\b/i.test(norm)) return false;
  // If user is greeting
  if (/^(salam|assalam|aoa|hi|hello|hey|adab|kese ho|how are you)\b/i.test(norm)) return false;
  // If user wants checkout / order dispatch
  if (/\b(order kardo|bhej do|deliver|khatam karo|checkout|bill kitna|order complete|pack kardo)\b/i.test(norm)) return false;
  // If correcting quantity
  if (/\b(nahi nahi|change to|make it|quantity)\b/i.test(norm) && cart.items.length > 0) return false;
  // If user explicitly wants to add items (ordering intent with menu items)
  if (/\b(bhej|de do|dedo|chahiye|chahye|kardo|kar do|add|mangwana|lagao|shamil)\b/i.test(norm)) return false;
  // If the message mentions "menu dikhao" or "deals" - handle locally for inline menu display
  if (/\b(menu dikhao|show menu|deals|deal dikhao|kya deals hain|options|kya milta hai)\b/i.test(norm)) return false;

  // ── Route to RAG for knowledge/FAQ questions ──
  // Price, ingredient, availability inquiries
  if (/\b(price|kitna|kitne|cost|rate|qeemat|قیمت|ingredient|kya dalta|kya hai|recipe|bana|banta)\b/i.test(norm)) return true;
  // Delivery, timing, hours, location questions
  if (/\b(delivery|charges|fee|timing|time|kitni der|der|hours|kab|open|close|address|location|kahan|branch)\b/i.test(norm)) return true;
  // Payment, cancellation, policy questions
  if (/\b(payment|cod|cash|card|jazzcash|easypaisa|cancel|refund|policy|halal|hygiene|clean)\b/i.test(norm)) return true;
  // General inquiry patterns
  if (/\b(bataiye|batao|tell me|kya hai|what is|how much|konsa|konsi|recommend|best|popular|famous|mashoor)\b/i.test(norm)) return true;
  // Questions with question marks
  if (norm.includes('?')) return true;
  // Urdu script questions (typically knowledge queries)
  if (/[\u0600-\u06FF]/.test(norm) && !/\b(bhej|add|lagao)\b/i.test(norm)) return true;

  // Default: use RAG for anything unrecognized (better than local fallback)
  return true;
}

export default function CustomerPhonePanel({ externalTriggerText, onClearExternalTrigger }) {
  const { 
    chatMessages, 
    addChatMessage, 
    cart, 
    setCart,
    clearCart, 
    placeOrder, 
    activeCustomer,
    flagConversationForAttention,
    menu,
    openOrderTracker,
    addToCart
  } = useApp();

  // Input & Messaging States
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentState, setAgentState] = useState({
    waitingForConfirmation: false,
    waitingForAddress: false,
    hasUpsold: false,
    lastItemAdded: null
  });

  // RAG State (for "What AI Understood" panel in ChatPage)
  const [lastRagResult, setLastRagResult] = useState(null);

  // Voice States (Phase 4)
  const [isTtsEnabled, setIsTtsEnabled] = useState(true); // TTS Voice Toggle
  const [sttLanguage, setSttLanguage] = useState('en-US'); // 'en-US' (Roman Urdu / English) | 'ur-PK' (Urdu Script)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceErrorNotice, setVoiceErrorNotice] = useState(null);

  const chatScrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll on new messages or typing/listening state changes
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, isListening, isSpeaking]);

  // Demo mode auto-trigger effect
  useEffect(() => {
    if (externalTriggerText) {
      handleSendMessage(externalTriggerText);
      onClearExternalTrigger?.();
    }
  }, [externalTriggerText]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Expose lastRagResult to parent through a custom event
  useEffect(() => {
    if (lastRagResult) {
      window.dispatchEvent(new CustomEvent('ragResultUpdate', { detail: lastRagResult }));
    }
  }, [lastRagResult]);

  /**
   * Barge-in helper: Stops TTS immediately if user speaks or interacts
   */
  const handleBargeIn = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  /**
   * Dispatches a message through either:
   *   A) Backend RAG API for knowledge/FAQ questions
   *   B) Local agentEngine for cart/ordering/checkout actions
   */
  const handleSendMessage = async (textToSend) => {
    const trimmed = (textToSend || inputText).trim();
    if (!trimmed || isTyping) return;

    // Barge-in: stop any playing speech
    handleBargeIn();

    setInputText('');
    setInterimTranscript('');

    // 1. Add user message bubble
    addChatMessage({
      sender: 'user',
      text: trimmed
    });

    // 2. Start typing indicator
    setIsTyping(true);

    // 3. Determine routing: RAG API or Local Agent Engine
    const useRag = shouldUseRag(trimmed, agentState, cart);

    if (useRag) {
      // ── Route A: Backend Vector Database RAG System ──
      try {
        // Build conversation history for context
        const recentHistory = chatMessages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

        const ragResponse = await api.chat.askRag(trimmed, recentHistory);

        // Store RAG result for the "What AI Understood" panel
        setLastRagResult({
          query: trimmed,
          reply: ragResponse.reply,
          detected_language: ragResponse.detected_language,
          retrieved_sources: ragResponse.retrieved_sources || [],
          extracted_items: ragResponse.extracted_items || [],
          context_used: ragResponse.context_used,
          has_retrieval: ragResponse.has_retrieval,
          source: 'rag_backend'
        });

        // If RAG extracted menu items, add them to cart
        if (ragResponse.extracted_items?.length > 0) {
          for (const item of ragResponse.extracted_items) {
            addToCart({
              id: item.id,
              item_code: item.id,
              name: item.name,
              price: item.price
            }, item.quantity || 1);
          }
        }

        setIsTyping(false);

        // Add agent reply with RAG source indicator
        addChatMessage({
          sender: 'agent',
          text: ragResponse.reply,
          ragSource: true,
          ragSources: ragResponse.retrieved_sources?.slice(0, 3) || [],
          detectedLanguage: ragResponse.detected_language
        });

        // TTS readout
        if (isTtsEnabled) {
          speakText(ragResponse.reply, {
            language: sttLanguage,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false)
          });
        }

      } catch (err) {
        console.warn('RAG API unavailable, falling back to local engine:', err?.message);

        // Fallback to local agent engine if RAG API is down
        handleLocalAgentResponse(trimmed);
      }
    } else {
      // ── Route B: Local Agent Engine (Cart, Orders, Checkout) ──
      const fakeDelay = Math.floor(450 + Math.random() * 300);
      setTimeout(() => {
        handleLocalAgentResponse(trimmed);
      }, fakeDelay);
    }
  };

  /**
   * Process message through local agentEngine (for cart/order management)
   */
  const handleLocalAgentResponse = (trimmed) => {
    const { reply, updatedCart, updatedState, action } = processAgentMessage({
      text: trimmed,
      cart,
      customer: activeCustomer,
      menu,
      agentState
    });

    // Update cart state if modified
    if (updatedCart) {
      setCart(updatedCart);
    }

    // Update internal conversational state
    if (updatedState) {
      setAgentState(updatedState);
    }

    // Store local result for tracking
    setLastRagResult({
      query: trimmed,
      reply: reply,
      detected_language: 'local',
      retrieved_sources: [],
      extracted_items: [],
      context_used: '',
      has_retrieval: false,
      source: 'local_engine'
    });

    // Stop typing & append agent message bubble
    setIsTyping(false);
    addChatMessage({
      sender: 'agent',
      text: reply,
      ragSource: false,
      localEngine: true
    });

    // TTS Readout (if Voice toggle is ON)
    if (isTtsEnabled) {
      speakText(reply, {
        language: sttLanguage,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }

    // Handle Actions
    if (action === 'REQUEST_HANDOFF') {
      flagConversationForAttention(`Customer requested human manager: "${trimmed}"`);
    }

    if (action === 'CREATE_ORDER') {
      const fullTranscript = [
        ...chatMessages,
        { id: 'usr-' + Date.now(), sender: 'user', text: trimmed, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { id: 'bot-' + Date.now(), sender: 'agent', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];

      (async () => {
        const created = await placeOrder({
          status: 'Pending',
          channel: isListening ? 'Voice Agent (STT)' : 'AI Chatbot',
          items: updatedCart.items,
          subtotal: updatedCart.subtotal,
          deliveryFee: updatedCart.deliveryFee,
          grandTotal: updatedCart.grandTotal,
          address: updatedCart.address || activeCustomer.address,
          paymentMethod: updatedCart.paymentMethod || 'Cash on Delivery (COD)',
          transcript: fullTranscript
        });

        if (created) {
          const num = created.order_number || created.orderNumber;
          addChatMessage({
            sender: 'agent',
            text: `Order ${num} confirmed! Kitchen has begun preparing your food. Click below to track live:`,
            trackingOrderNumber: num
          });
        }
      })();

      // Reset agent dialog state for next order
      setAgentState({
        waitingForConfirmation: false,
        waitingForAddress: false,
        hasUpsold: false,
        lastItemAdded: null
      });
    }
  };

  /**
   * Start / Stop Microphone Voice Recognition (STT)
   */
  const toggleListening = () => {
    // 1. Barge-in: If agent is speaking, stop TTS immediately
    handleBargeIn();

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    // Check browser support
    if (!isSpeechRecognitionSupported()) {
      setVoiceErrorNotice('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    setVoiceErrorNotice(null);
    setInterimTranscript('Listening... Speak now (Boliye)...');
    setIsListening(true);

    const recognition = startVoiceRecognition({
      language: sttLanguage,
      onResult: ({ transcript, isFinal }) => {
        // Barge-in: ensure speech stops if user started speaking
        handleBargeIn();
        setInterimTranscript(transcript);
        setInputText(transcript); // Put in input box so user can edit before sending!
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        setInterimTranscript('');
        if (err === 'not-allowed') {
          setVoiceErrorNotice('Microphone permission was denied. Please allow microphone access or type your order.');
        } else if (err !== 'no-speech') {
          setVoiceErrorNotice(`Voice recognition notice: ${err}. Switched to text input.`);
        }
      }
    });

    recognitionRef.current = recognition;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleQuickChip = (chipText) => {
    handleSendMessage(chipText);
  };

  const handleTalkToHuman = () => {
    handleSendMessage('Bhai mujhe human manager se baat karni hai');
  };

  return (
    <div className="flex justify-center items-start w-full">
      {/* Smartphone Frame Container */}
      <div className="w-full max-w-[420px] bg-slate-900 border-[6px] border-slate-800 rounded-[2.5rem] shadow-2xl shadow-black/80 overflow-hidden flex flex-col h-[780px] relative">
        
        {/* Smartphone Speaker & Notch Bar */}
        <div className="bg-slate-950 pt-2 pb-1.5 px-6 flex items-center justify-between text-[11px] text-slate-400 font-medium select-none border-b border-slate-800/60">
          <span>12:30</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Header with Title, Voice TTS Toggle, and Human Handoff */}
        <div className="bg-slate-950/95 border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-base shadow-md">
                🍗
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white leading-none">Dastarkhwan AI</h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">
                  RAG Online
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[110px]">
                Customer: <span className="text-orange-400 font-medium">{activeCustomer.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice TTS Toggle Switch */}
            <button
              onClick={() => {
                const nextState = !isTtsEnabled;
                setIsTtsEnabled(nextState);
                if (!nextState) stopSpeaking();
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                isTtsEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title={isTtsEnabled ? 'TTS Voice replies active (Click to mute)' : 'TTS Voice muted (Click to unmute)'}
            >
              {isTtsEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>{isTtsEnabled ? 'Voice ON' : 'Muted'}</span>
            </button>

            {/* Human Handoff Button */}
            <button
              onClick={handleTalkToHuman}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-semibold transition-all active:scale-95"
              title="Connect with restaurant manager"
            >
              <UserCheck className="w-3 h-3" />
              <span className="hidden sm:inline">Handoff</span>
            </button>
          </div>
        </div>

        {/* Fallback Notice Banner (Unsupported or Permission Denied) */}
        {voiceErrorNotice && (
          <div className="bg-amber-950/80 border-b border-amber-500/40 p-2.5 px-3 flex items-start justify-between gap-2 text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">{voiceErrorNotice}</span>
            </div>
            <button
              onClick={() => setVoiceErrorNotice(null)}
              className="text-[10px] text-amber-400 hover:text-white font-bold shrink-0 ml-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick-Reply Chips Bar */}
        <div className="bg-slate-950/60 px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">Quick:</span>
          {[
            'Menu dikhao',
            'Deals',
            'Delivery charges?',
            'Payment methods?',
            '2 Zinger aur Pepsi',
            'Talk to human'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChip(chip)}
              className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors border border-slate-700/60 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950/80">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md leading-relaxed ${
                    isUser
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-none font-normal'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* RAG Source Indicator Badge */}
                  {msg.ragSource && (
                    <div className="mt-2 pt-2 border-t border-slate-700/40 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-cyan-400" />
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">
                          Vector DB Answer
                        </span>
                      </div>
                      {msg.ragSources?.length > 0 && (
                        <div className="space-y-1">
                          {msg.ragSources.map((src, i) => (
                            <div key={i} className="flex items-center gap-1 text-[9px] text-slate-400">
                              <Zap className="w-2.5 h-2.5 text-amber-400" />
                              <span className="truncate max-w-[180px]">{src.title}</span>
                              <span className="text-cyan-400 font-bold ml-auto whitespace-nowrap">
                                {src.similarity_percent}% match
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Local Engine Badge */}
                  {msg.localEngine && !msg.ragSource && (
                    <div className="mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span className="text-[9px] text-amber-400/70 font-medium">
                        Cart Engine
                      </span>
                    </div>
                  )}

                  {msg.trackingOrderNumber && (
                    <button
                      type="button"
                      onClick={() => openOrderTracker(msg.trackingOrderNumber)}
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order {msg.trackingOrderNumber} Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700/60 w-fit px-3 py-2 rounded-2xl rounded-tl-none text-slate-400">
              <span className="text-[10px] mr-1 text-slate-400 font-medium">Searching database</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          {/* Speaking Audio Waveform (TTS Playing) */}
          {isSpeaking && (
            <div className="flex items-center justify-between bg-emerald-950/50 border border-emerald-500/40 p-2 px-3 rounded-xl text-emerald-300 text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-[11px] font-semibold">AI is speaking response...</span>
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </div>
              <button
                onClick={handleBargeIn}
                className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-md hover:bg-emerald-400"
              >
                Stop Audio
              </button>
            </div>
          )}

          <div ref={chatScrollRef} />
        </div>

        {/* Live Voice Listening Card & Animated Waveform */}
        {isListening && (
          <div className="bg-slate-950/95 border-t border-red-500/40 p-3 space-y-2 shadow-xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-red-400">
                  Listening ({sttLanguage === 'ur-PK' ? 'اردو - ur-PK' : 'Roman Urdu/English - en-US'})...
                </span>
              </div>
              
              {/* Waveform Bars Animation */}
              <div className="flex items-center gap-1 h-4">
                <span className="w-1 bg-red-400 rounded-full animate-pulse h-3" />
                <span className="w-1 bg-orange-400 rounded-full animate-bounce h-4" />
                <span className="w-1 bg-amber-400 rounded-full animate-pulse h-2.5" />
                <span className="w-1 bg-red-400 rounded-full animate-bounce h-4" />
                <span className="w-1 bg-orange-400 rounded-full animate-pulse h-2" />
              </div>

              <button
                onClick={toggleListening}
                className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                title="Stop listening"
              >
                <Square className="w-3 h-3 text-red-400" />
                <span className="text-[10px]">Stop</span>
              </button>
            </div>

            {/* Live Interim Transcript Display */}
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-white">
              <p className="italic text-slate-300">
                "{interimTranscript || 'Bolna shuru karein...'}"
              </p>
            </div>

            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-orange-400" />
              <span>Transcript is synced to the box below. You can edit it before sending!</span>
            </p>
          </div>
        )}

        {/* Live Cart Summary Card Inside the Chat Panel */}
        {cart.items.length > 0 && !isListening && (
          <div className="bg-slate-950/95 border-t border-slate-800/90 p-3 space-y-2 shadow-2xl">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Cart ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </div>
              <button
                onClick={clearCart}
                className="text-[10px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                title="Empty Cart"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>

            {/* Itemized Cart List */}
            <div className="max-h-20 overflow-y-auto space-y-1 text-[11px] pr-1">
              {cart.items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1 truncate max-w-[220px]">
                    <span className="font-bold text-orange-400">{it.quantity}x</span>
                    <span className="truncate">{it.name}</span>
                    {it.modifiers?.length > 0 && (
                      <span className="text-[9px] text-slate-500 truncate">({it.modifiers.join(', ')})</span>
                    )}
                  </div>
                  <span className="text-slate-400 font-medium">Rs. {it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals & Quick Action */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Total + Delivery: </span>
                <span className="font-bold text-emerald-400">Rs. {cart.grandTotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => handleSendMessage('Order kardo')}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Checkout</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Input Bar with Mic Button, Language Selector & Text Input */}
        <form
          onSubmit={handleFormSubmit}
          className="bg-slate-950 border-t border-slate-800 p-2.5 flex items-center gap-2"
        >
          {/* Language Selector (ur-PK vs en-US) */}
          <select
            value={sttLanguage}
            onChange={(e) => setSttLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium rounded-lg px-1.5 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
            title="Speech Recognition Language Mode"
          >
            <option value="en-US">en-US (Roman Urdu)</option>
            <option value="ur-PK">ur-PK (اردو اسکرپٹ)</option>
          </select>

          {/* Mic Button with Pulsing Listening State */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-all relative ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-orange-400'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice ordering'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
            )}
          </button>

          {/* Editable Input Box for Typed or Spoken Transcript */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder={
              isListening 
                ? 'Listening to your voice...' 
                : isTyping 
                ? 'Searching vector database...' 
                : 'Ask anything or order food...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-orange-500/20 transition-all active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
