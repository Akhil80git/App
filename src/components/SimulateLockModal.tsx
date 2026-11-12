import React, { useState, useEffect } from 'react';
import { AndroidApp } from '../types/app';
import { AppIcon } from './AppIcon';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Timer, 
  Sparkles, 
  KeyRound, 
  Smartphone, 
  ArrowLeft, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  app: AndroidApp | null;
  isOpen: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const SimulateLockModal: React.FC<Props> = ({
  app,
  isOpen,
  onClose,
  language,
}) => {
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [unlockRequested, setUnlockRequested] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    soundEffects.playWarning();
    const interval = setInterval(() => {
      setBreathePhase((prev) => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !app) return null;

  const now = Date.now();
  const isTimeLocked = !!(app.lockUntil && app.lockUntil > now);
  const remainingSeconds = isTimeLocked && app.lockUntil ? Math.max(0, Math.floor((app.lockUntil - now) / 1000)) : 1800; // default 30m if manual
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      soundEffects.playUnlock();
      onClose();
    } else {
      setPinError(true);
      soundEffects.playWarning();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      
      {/* Mobile Device Mockup Container */}
      <div className="relative w-full max-w-sm rounded-[40px] bg-slate-950 border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col text-slate-100 min-h-[580px]">
        
        {/* Android Punch Hole Camera & Speaker */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-b-xl bg-slate-900 flex items-center justify-center gap-2 z-20">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
          <div className="w-10 h-1 rounded-full bg-slate-800" />
        </div>

        {/* Android Status Bar */}
        <div className="pt-2 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 border-b border-slate-900">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Close Modal Preview */}
        <button
          onClick={onClose}
          className="absolute top-8 right-4 z-30 p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition"
          title="Exit Simulator"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Body: Simulated Android Intercept Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60">
          
          {/* Pulsing Lock Aura */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-rose-500/20 blur-xl animate-pulse" />
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center shadow-xl relative`}>
              <AppIcon iconName={app.iconName} className="w-10 h-10 text-white" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-600 border-2 border-slate-950 flex items-center justify-center text-white shadow-lg">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-semibold text-xs tracking-wider uppercase mb-2">
            {language === 'hi' ? 'ऐप बंद है (App Blocked)' : 'App Blocked by AppLocker'}
          </span>

          <h2 className="text-xl font-bold text-white mb-1">
            {app.name}
          </h2>

          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {language === 'hi'
              ? 'यह ऐप आपके द्वारा तय किए गए स्क्रीन-टाइम लॉक के तहत अभी बंद है।'
              : 'This app is currently locked to keep you focused on what matters.'}
          </p>

          {/* Countdown Clock Box */}
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-inner">
            <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-semibold uppercase mb-1">
              <Timer className="w-3.5 h-3.5 animate-spin" />
              <span>{language === 'hi' ? 'खुलने में बाकी समय' : 'Time Remaining'}</span>
            </div>
            <div className="text-2xl font-mono font-black text-white tracking-wider">
              {remainingHours > 0 ? `${remainingHours}h ` : ''}{remainingMinutes}m {remainingSeconds % 60}s
            </div>
          </div>

          {/* Calming Mindfulness / Breathing Widget */}
          <div className="w-full bg-slate-800/40 rounded-2xl p-3 border border-slate-700/40 mb-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 transition-transform duration-1000 ${
              breathePhase === 'Inhale' ? 'scale-110' : breathePhase === 'Hold' ? 'scale-105' : 'scale-90'
            }`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-semibold text-emerald-400">
                {language === 'hi' ? 'गहरी सांस लें (Pause & Breathe):' : 'Pause & Breathe:'} {breathePhase}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {language === 'hi' ? 'फोकस बनाए रखें, यह समय आपके काम का है!' : 'Stay disciplined! Your future self will thank you.'}
              </p>
            </div>
          </div>

          {/* Unlock with PIN Toggle */}
          {unlockRequested ? (
            <form onSubmit={handlePinSubmit} className="w-full space-y-2">
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="Enter PIN (Default: 1234)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full text-center tracking-widest text-lg font-mono bg-slate-800 border border-slate-600 rounded-xl py-2 text-white focus:outline-none focus:border-rose-400"
              />
              {pinError && (
                <p className="text-[10px] text-rose-400">
                  {language === 'hi' ? 'गलत पिन! सही पिन 1234 है।' : 'Wrong PIN! Default test PIN is 1234'}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnlockRequested(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {language === 'hi' ? 'वापस' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md"
                >
                  {language === 'hi' ? 'अनलॉक' : 'Unlock'}
                </button>
              </div>
            </form>
          ) : (
            <div className="w-full space-y-2">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'hi' ? 'ऐप बंद करें और काम करें' : 'Return to Home Screen'}</span>
              </button>

              <button
                onClick={() => setUnlockRequested(true)}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto pt-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>{language === 'hi' ? 'इमरजेंसी PIN से खोलें' : 'Emergency PIN Override'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Android Virtual Bottom Navigation Bar */}
        <div className="h-10 bg-slate-950 border-t border-slate-900 flex items-center justify-around px-12 text-slate-600">
          <div className="w-3.5 h-3.5 border-l-2 border-b-2 border-slate-600 -rotate-45" />
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600" />
          <div className="w-3.5 h-3.5 border-2 border-slate-600 rounded-sm" />
        </div>

      </div>
    </div>
  );
};
