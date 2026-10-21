import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { processAgentMessage } from '../services/agentEngine';
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported
} from '../services/speechService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  X,
  Send,
  ChevronDown,
  Bot,
  User,
  Languages,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Square,
  Zap
} from 'lucide-react';

// Animated waveform bars shown while listening / speaking
function VoiceWaveform({ active, color = 'orange' }) {
  if (!active) return null;
  const barHeights = [40, 70, 55, 90, 60, 80, 45, 75, 50, 65];
  return (
    <div className="flex items-center gap-0.5 h-5">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full bg-${color}-400 animate-pulse`}
          style={{
            height: `${h}%`,
            animationDelay: `${i * 80}ms`,
            animationDuration: `${600 + i * 50}ms`
          }}
        />
      ))}
    </div>
  );
}

// Individual chat message bubble
function ChatBubble({ message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mb-0.5">
          AI
        </div>
      )}
      <div
        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-sm'
            : 'bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm'
        }`}
      >
        <p>{message.text}</p>
        {message.time && (
          <span className={`text-[9px] mt-0.5 block ${isUser ? 'text-orange-200' : 'text-slate-500'}`}>
            {message.time}
          </span>
        )}
      </div>
      {isUser && (
        <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mb-0.5">
          <User className="w-3 h-3 text-slate-300" />
        </div>
      )}
    </div>
  );
}

// ─── Main Floating Voice Chat ─────────────────────────────────────────────────
export default function FloatingVoiceChat() {
  const {
    chatMessages,
    addChatMessage,
    cart,
    setCart,
    placeOrder,
    activeCustomer,
    menu,
    flagConversationForAttention
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'voice'
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentState, setAgentState] = useState({
    waitingForConfirmation: false,
    waitingForAddress: false,
    hasUpsold: false,
    lastItemAdded: null
  });

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [sttLanguage, setSttLanguage] = useState('en-US');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const [agentVoiceResponse, setAgentVoiceResponse] = useState(
    'Assalam-o-Alaikum! Mic dabayein aur bol kar order dein (e.g. "2 zinger burger aur thanda Pepsi")'
  );
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const recognitionRef = useRef(null);
  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current && isOpen) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping, isOpen]);

  // Show notification dot when closed and new message arrives
  useEffect(() => {
    if (!isOpen && chatMessages.length > 0) {
      setHasNewMessage(true);
    }
  }, [chatMessages]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // ── Text Chat ──────────────────────────────────────────────────────────────
  const handleSendText = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    addChatMessage({ sender: 'user', text });
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

    const { reply, updatedCart, updatedState, action } = processAgentMessage({
      text,
      cart,
      customer: activeCustomer,
      menu,
      agentState,
      flagConversation: flagConversationForAttention
    });

    if (updatedCart) setCart(updatedCart);
    if (updatedState) setAgentState(updatedState);
    setIsTyping(false);
    addChatMessage({ sender: 'agent', text: reply });

    if (action === 'CREATE_ORDER') {
      const targetCart = updatedCart || cart;
      placeOrder({
        status: 'New',
        channel: 'Floating Chat Agent',
        items: targetCart.items,
        subtotal: targetCart.subtotal,
        deliveryFee: targetCart.deliveryFee,
        grandTotal: targetCart.grandTotal,
        address: targetCart.address || activeCustomer.address,
        transcript: [...chatMessages, { sender: 'user', text }, { sender: 'agent', text: reply }]
      });
      setAgentState({ waitingForConfirmation: false, waitingForAddress: false, hasUpsold: false, lastItemAdded: null });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // ── Voice ──────────────────────────────────────────────────────────────────
  const handleBargeIn = () => {
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); }
  };

  const handleToggleMic = () => {
    handleBargeIn();

    if (isListening) {
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Web Speech API not supported. Please use Chrome or Edge.');
      return;
    }

    setVoiceError(null);
    setLiveTranscript('');
    setIsListening(true);

    const rec = startVoiceRecognition({
      language: sttLanguage,
      onResult: ({ transcript: text, isFinal }) => {
        handleBargeIn();
        setLiveTranscript(text);
        if (isFinal) {
          setIsListening(false);
          handleProcessVoice(text);
        }
      },
      onEnd: () => setIsListening(false),
      onError: (err) => {
        setIsListening(false);
        if (err === 'not-allowed') setVoiceError('Mic permission denied. Allow mic in browser settings.');
        else if (err !== 'no-speech') setVoiceError(`Voice error: ${err}`);
      }
    });
    recognitionRef.current = rec;
  };

  const handleProcessVoice = (speechText) => {
    if (!speechText.trim()) return;
    setLiveTranscript('');

    // Also add to the chat log so both tabs stay in sync
    addChatMessage({ sender: 'user', text: `🎙️ ${speechText}` });

    const { reply, updatedCart, updatedState, action } = processAgentMessage({
      text: speechText,
      cart,
      customer: activeCustomer,
      menu,
      agentState,
      flagConversation: flagConversationForAttention
    });

    if (updatedCart) setCart(updatedCart);
    if (updatedState) setAgentState(updatedState);
    setAgentVoiceResponse(reply);
    addChatMessage({ sender: 'agent', text: reply });

    if (!isTtsMuted) {
      speakText(reply, {
        language: sttLanguage,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }

    if (action === 'CREATE_ORDER') {
      const targetCart = updatedCart || cart;
      placeOrder({
        status: 'New',
        channel: 'Voice Agent (Floating)',
        items: targetCart.items,
        subtotal: targetCart.subtotal,
        deliveryFee: targetCart.deliveryFee,
        grandTotal: targetCart.grandTotal,
        address: targetCart.address || activeCustomer.address,
        transcript: chatMessages
      });
      setAgentState({ waitingForConfirmation: false, waitingForAddress: false, hasUpsold: false, lastItemAdded: null });
    }
  };

  const cartItemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* ── Floating Trigger Button ──────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

        {/* Tooltip label (shown when closed) */}
        {!isOpen && (
          <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700 px-3 py-2 rounded-xl shadow-xl text-xs text-white font-medium pointer-events-none animate-in fade-in duration-300">
            <Zap className="w-3 h-3 text-orange-400" />
            <span>AI Order Agent</span>
          </div>
        )}

        {/* Main FAB */}
        <button
          onClick={() => { setIsOpen(v => !v); setHasNewMessage(false); }}
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
            isOpen
              ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rotate-0'
              : 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white hover:from-orange-400 hover:to-amber-300 shadow-orange-500/40'
          }`}
          aria-label="Open AI ordering assistant"
        >
          {isOpen ? (
            <ChevronDown className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}

          {/* Listening pulse ring */}
          {isListening && (
            <span className="absolute inset-0 rounded-2xl border-2 border-red-400 animate-ping opacity-75" />
          )}

          {/* New message dot */}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-950 animate-pulse" />
          )}

          {/* Cart badge */}
          {cartItemCount > 0 && !isOpen && (
            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 text-[9px] font-black text-white flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Chat Panel ──────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          style={{ height: '560px', maxHeight: 'calc(100vh - 8rem)' }}
        >
          {/* Panel Header */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                🥘
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Dastarkhwan AI</span>
                  {(isListening || isSpeaking) && (
                    <VoiceWaveform active color="orange" />
                  )}
                </div>
                <span className="text-[10px] text-emerald-400">● Online · {sttLanguage === 'ur-PK' ? 'اردو' : 'English/Roman Urdu'}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* TTS toggle */}
              <button
                onClick={() => { const n = !isTtsMuted; setIsTtsMuted(n); if (n) stopSpeaking(); }}
                className={`p-1.5 rounded-lg text-xs border transition-all ${
                  !isTtsMuted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title={isTtsMuted ? 'Enable voice reply' : 'Mute voice reply'}
              >
                {isTtsMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex bg-slate-950 border-b border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                activeTab === 'chat'
                  ? 'text-orange-400 border-orange-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Text Chat
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                activeTab === 'voice'
                  ? 'text-orange-400 border-orange-500'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              Voice Order
            </button>
          </div>

          {/* ── CHAT TAB ──────────────────────────────────────────────── */}
          {activeTab === 'chat' && (
            <>
              {/* Messages */}
              <div
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
              >
                {chatMessages.map(msg => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}

                {isTyping && (
                  <div className="flex items-end gap-2 justify-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      AI
                    </div>
                    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-3">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Reply Chips */}
              <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {['Menu dikhao 🍔', 'Deals kya hain? 🔥', '2 zinger de do', 'Order confirm', 'Help'].map(chip => (
                  <button
                    key={chip}
                    onClick={() => { setInputText(chip); setTimeout(() => inputRef.current?.focus(), 50); }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 border border-slate-700 hover:border-orange-500/30 text-[10px] font-medium whitespace-nowrap transition-all"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="px-3 pb-3 shrink-0">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 focus-within:border-orange-500 transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your order in any language..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSendText}
                    disabled={!inputText.trim()}
                    className="w-7 h-7 rounded-xl bg-orange-500 disabled:bg-slate-700 text-white flex items-center justify-center transition-all active:scale-90 disabled:text-slate-500 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── VOICE TAB ─────────────────────────────────────────────── */}
          {activeTab === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-between p-5 overflow-hidden">

              {/* Language selector */}
              <div className="w-full flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <Languages className="w-3.5 h-3.5 text-orange-400" />
                  <select
                    value={sttLanguage}
                    onChange={e => setSttLanguage(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="en-US" className="bg-slate-900">English / Roman Urdu</option>
                    <option value="ur-PK" className="bg-slate-900">اردو (Urdu Script)</option>
                  </select>
                </div>
                {isSpeaking && (
                  <button
                    onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                    className="flex items-center gap-1 text-[10px] text-red-400 border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 rounded-xl font-medium"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Stop Speaking
                  </button>
                )}
              </div>

              {/* Central Orb */}
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                {/* Orb Button */}
                <div className="relative">
                  {/* Outer pulse rings */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping scale-125" />
                      <span className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping scale-150" style={{ animationDelay: '300ms' }} />
                    </>
                  )}
                  {isSpeaking && (
                    <>
                      <span className="absolute inset-0 rounded-full border-2 border-emerald-400/50 animate-ping scale-125" />
                      <span className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping scale-150" style={{ animationDelay: '200ms' }} />
                    </>
                  )}

                  <button
                    onClick={handleToggleMic}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
                      isListening
                        ? 'bg-red-500 shadow-red-500/40 scale-105'
                        : isSpeaking
                        ? 'bg-emerald-500 shadow-emerald-500/40'
                        : 'bg-gradient-to-tr from-orange-500 to-amber-400 shadow-orange-500/40 hover:scale-105'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-9 h-9 text-white" />
                    ) : isSpeaking ? (
                      <Volume2 className="w-9 h-9 text-white" />
                    ) : (
                      <Mic className="w-9 h-9 text-white" />
                    )}
                  </button>
                </div>

                {/* Status label */}
                <div className="text-center space-y-1">
                  <p className={`text-sm font-bold ${
                    isListening ? 'text-red-400' : isSpeaking ? 'text-emerald-400' : 'text-slate-300'
                  }`}>
                    {isListening ? '🎙️ Listening...' : isSpeaking ? '🔊 Speaking...' : 'Tap mic to speak'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isListening ? 'Speak clearly · Barge-in supported' : 'Roman Urdu, Urdu & English supported'}
                  </p>
                </div>

                {/* Live transcript */}
                {liveTranscript && (
                  <div className="w-full bg-slate-950 border border-orange-500/30 rounded-2xl p-3 text-xs text-center">
                    <span className="text-[10px] text-orange-400 block mb-1 font-bold uppercase tracking-wider">Live Transcript</span>
                    <p className="text-white italic">"{liveTranscript}"</p>
                  </div>
                )}
              </div>

              {/* Agent last response */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                  <Bot className="w-3 h-3" />
                  AI Agent Response
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{agentVoiceResponse}</p>
              </div>

              {/* Error banner */}
              {voiceError && (
                <div className="w-full flex items-start gap-2 bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>{voiceError}</span>
                </div>
              )}
            </div>
          )}

          {/* Cart Mini-strip (shown when cart has items) */}
          {cartItemCount > 0 && (
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400" />
                <span><strong className="text-white">{cartItemCount}</strong> item{cartItemCount > 1 ? 's' : ''} · Rs. <strong className="text-emerald-400">{cart.grandTotal.toLocaleString()}</strong></span>
              </div>
              <button
                onClick={() => {
                  const confirmed = window.confirm('Place this order now?');
                  if (confirmed) placeOrder();
                }}
                className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                Place Order
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
