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
  Languages, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  Square, 
  Edit3, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export default function VoicePage() {
  const { 
    cart, 
    setCart, 
    clearCart, 
    placeOrder, 
    activeCustomer, 
    menu 
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [sttLanguage, setSttLanguage] = useState('en-US'); // 'en-US' | 'ur-PK'
  const [transcript, setTranscript] = useState('');
  const [agentResponse, setAgentResponse] = useState('Assalam-o-Alaikum! Mic dabayein aur bol kar apna order dein (maslan: "2 zinger burger aur thanda pepsi").');
  const [voiceError, setVoiceError] = useState(null);
  const [agentState, setAgentState] = useState({
    waitingForConfirmation: false,
    waitingForAddress: false,
    hasUpsold: false,
    lastItemAdded: null
  });

  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleBargeIn = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handleToggleListening = () => {
    handleBargeIn();

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    setVoiceError(null);
    setTranscript('');
    setIsListening(true);

    const rec = startVoiceRecognition({
      language: sttLanguage,
      onResult: ({ transcript: text, isFinal }) => {
        handleBargeIn();
        setTranscript(text);
        if (isFinal) {
          setIsListening(false);
          handleProcessVoiceInput(text);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        if (err === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone permissions in browser settings.');
        } else if (err !== 'no-speech') {
          setVoiceError(`Voice recognition: ${err}`);
        }
      }
    });

    recognitionRef.current = rec;
  };

  const handleProcessVoiceInput = (speechText) => {
    if (!speechText.trim()) return;

    // Process through agent engine
    const { reply, updatedCart, updatedState, action } = processAgentMessage({
      text: speechText,
      cart,
      customer: activeCustomer,
      menu,
      agentState
    });

    if (updatedCart) setCart(updatedCart);
    if (updatedState) setAgentState(updatedState);
    setAgentResponse(reply);

    // Speak response
    if (!isTtsMuted) {
      speakText(reply, {
        language: sttLanguage,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false)
      });
    }

    // Handle order creation
    if (action === 'CREATE_ORDER') {
      placeOrder({
        status: 'New',
        channel: 'Voice Orb Agent (Web Speech)',
        items: updatedCart.items,
        subtotal: updatedCart.subtotal,
        deliveryFee: updatedCart.deliveryFee,
        grandTotal: updatedCart.grandTotal,
        address: updatedCart.address || activeCustomer.address
      });
      setAgentState({
        waitingForConfirmation: false,
        waitingForAddress: false,
        hasUpsold: false,
        lastItemAdded: null
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Voice Ordering Experience
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hands-free conversational ordering with speech recognition, TTS feedback, and barge-in.
          </p>
        </div>

        {/* Top Voice Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            <select
              value={sttLanguage}
              onChange={(e) => setSttLanguage(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs"
            >
              <option value="en-US" className="bg-slate-900 text-white">English / Roman Urdu (en-US)</option>
              <option value="ur-PK" className="bg-slate-900 text-white">Urdu Script - اردو (ur-PK)</option>
            </select>
          </div>

          {/* TTS Mute Toggle */}
          <button
            onClick={() => {
              const next = !isTtsMuted;
              setIsTtsMuted(next);
              if (next) stopSpeaking();
            }}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
              !isTtsMuted 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={!isTtsMuted ? "Audio speech is ON (Click to mute)" : "Audio speech is MUTED"}
          >
            {!isTtsMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Voice Error Notice */}
      {voiceError && (
        <div className="bg-amber-950/70 border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button onClick={() => setVoiceError(null)} className="text-amber-400 font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Glowing Voice Orb Panel + Active Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Mic Orb & Transcript Stream (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center space-y-8 text-center relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className={`absolute w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isListening 
              ? 'bg-red-500/15' 
              : isSpeaking 
              ? 'bg-emerald-500/15' 
              : 'bg-orange-500/10'
          }`} />

          {/* Central Glowing Mic Orb */}
          <div className="relative z-10 flex flex-col items-center">
            <button
              onClick={handleToggleListening}
              className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 to-orange-500 text-white ring-8 ring-red-500/30 scale-105 animate-pulse'
                  : isSpeaking
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-8 ring-emerald-500/30'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white hover:scale-105 shadow-orange-500/30 ring-4 ring-orange-500/20'
              }`}
            >
              {isListening ? (
                <Square className="w-10 h-10 fill-current" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
              <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">
                {isListening ? 'Stop' : isSpeaking ? 'Speaking' : 'Tap to Speak'}
              </span>

              {/* Pulsing Outer Rings */}
              {isListening && (
                <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
              )}
            </button>

            {/* Status Label */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isListening ? 'bg-red-500 animate-ping' : isSpeaking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`} />
              <span className="text-xs font-semibold text-slate-300">
                {isListening 
                  ? `Listening in ${sttLanguage === 'ur-PK' ? 'اردو' : 'Roman Urdu'}...` 
                  : isSpeaking 
                  ? 'AI Speaking Response aloud...' 
                  : 'Ready. Tap the orb and start speaking.'}
              </span>
            </div>
          </div>

          {/* Transcript Box */}
          <div className="w-full space-y-3 z-10">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Live Speech Transcript
              </span>
              <p className="text-sm text-white font-mono min-h-8">
                {transcript ? `"${transcript}"` : <span className="text-slate-600 italic">Spoken words will appear here in real time...</span>}
              </p>
            </div>

            {/* Agent Spoken Response Bubble */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Assistant Reply
              </span>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {agentResponse}
              </p>
            </div>
          </div>

          {/* Quick Voice Prompt Pills */}
          <div className="w-full z-10 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 block mb-2">Or test these sample voice commands:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Bhai 2 zinger burger aur thanda pepsi',
                'Nahi 2 nahi, 3 zinger kardo',
                'Midnight Deal 1 lagao',
                'Order confirm kardo please'
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTranscript(cmd);
                    handleProcessVoiceInput(cmd);
                  }}
                  className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary Side Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Active Order Basket</h3>
                <span className="text-[10px] text-slate-400">{cart.items.length} item(s) detected via voice</span>
              </div>
            </div>

            {cart.items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {cart.items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              Your voice basket is empty. Say "2 zinger burger" to start!
            </div>
          ) : (
            <div className="space-y-3">
              <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto pr-1">
                {cart.items.map(it => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-orange-400">{it.quantity}x</span>
                        <span className="font-semibold text-white">{it.name}</span>
                      </div>
                      {it.modifiers?.length > 0 && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {it.modifiers.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="text-slate-300 font-semibold">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
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

              {/* Confirm voice order button */}
              <button
                onClick={() => handleProcessVoiceInput('Haan order confirm kardo')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Send to Kitchen</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
