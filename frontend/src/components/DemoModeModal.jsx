import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  Square, 
  Sparkles, 
  CheckCircle2, 
  Bot, 
  User, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const SCRIPTED_STEPS = [
  {
    step: 1,
    title: 'Text Order with Roman Urdu & Quantity',
    userText: 'Bhai 3 zinger burger aur 1 thanda pepsi de do',
    description: 'Demonstrates item detection, numerals in words ("3 zinger"), and soft drink detection.'
  },
  {
    step: 2,
    title: 'Mid-Conversation Quantity Correction',
    userText: 'Nahi nahi, 3 nahi, 2 zinger kardo',
    description: 'Demonstrates conversational state tracking and on-the-fly cart quantity updating.'
  },
  {
    step: 3,
    title: 'Out-of-Menu Rejection (Never Guesses)',
    userText: 'Sath 1 plate chicken biryani bhi pack kardo',
    description: 'Demonstrates grounded menu boundary: politely refuses biryani without hallucinating.'
  },
  {
    step: 4,
    title: 'Checkout & Full Bill Read-back',
    userText: 'Order kardo please, COD pe',
    description: 'Demonstrates address validation, payment confirmation, and full itemized read-back.'
  },
  {
    step: 5,
    title: 'Final Confirmation & Live Kitchen Dispatch',
    userText: 'Ji haan bilkul theek hai, confirm kardo',
    description: 'Final order confirmation: triggers sound chime and live Kanban dispatch in "New" column!'
  }
];

export default function DemoModeModal({ isOpen, onClose, onExecuteStep }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepTimer, setStepTimer] = useState(null);

  useEffect(() => {
    if (!isPlaying) {
      if (stepTimer) clearTimeout(stepTimer);
      return;
    }

    if (currentStepIndex >= SCRIPTED_STEPS.length) {
      setIsPlaying(false);
      return;
    }

    const currentScript = SCRIPTED_STEPS[currentStepIndex];

    // Execute step in chat panel
    onExecuteStep(currentScript.userText);

    // Schedule next step after delay (gives time for user typing + bot reply)
    const timer = setTimeout(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next >= SCRIPTED_STEPS.length) {
          setIsPlaying(false);
        }
        return next;
      });
    }, 4200);

    setStepTimer(timer);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex]);

  if (!isOpen) return null;

  const handleStart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (stepTimer) clearTimeout(stepTimer);
  };

  const handleStepManual = (index) => {
    setCurrentStepIndex(index);
    onExecuteStep(SCRIPTED_STEPS[index].userText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Auto-Play Scripted Demo</h3>
              <p className="text-xs text-slate-400">Supervisor backup presentation runner</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Description Banner */}
        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          This mode auto-types a realistic 5-step conversation to present to your project supervisor. Watch the phone chat on the left and the Kanban board on the right!
        </p>

        {/* Scripted Steps Sequence */}
        <div className="space-y-2">
          {SCRIPTED_STEPS.map((s, idx) => {
            const isActive = isPlaying && currentStepIndex === idx;
            const isDone = currentStepIndex > idx;

            return (
              <div 
                key={s.step}
                onClick={() => !isPlaying && handleStepManual(idx)}
                className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                    : isDone
                    ? 'bg-slate-950/60 border-slate-800/60 text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-orange-500 text-white animate-pulse' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDone ? '✓' : s.step}
                    </span>
                    <span className="font-semibold text-white">{s.title}</span>
                  </div>
                  {isActive && <span className="text-[10px] text-orange-400 font-bold animate-pulse">Running...</span>}
                </div>
                <p className="text-[11px] text-amber-300/90 font-mono mt-1.5 pl-7">
                  "{s.userText}"
                </p>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Full Demo (Auto-play)</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Auto-play</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
}
