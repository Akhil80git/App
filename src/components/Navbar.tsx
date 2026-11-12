import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Languages, 
  Timer, 
  Zap, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface Props {
  language: 'hi' | 'en';
  onToggleLanguage: () => void;
  strictMode: boolean;
  onToggleStrictMode: () => void;
  onOpenSync: () => void;
  onOpenQuickLock: () => void;
  lockedCount: number;
}

export const Navbar: React.FC<Props> = ({
  language,
  onToggleLanguage,
  strictMode,
  onToggleStrictMode,
  onOpenSync,
  onOpenQuickLock,
  lockedCount,
}) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-950/50">
              <ShieldCheck className="w-5 h-5 font-bold" />
            </div>
            {/* Live active lock badge */}
            {lockedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-950 animate-pulse">
                {lockedCount}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AppLocker <span className="text-emerald-400">Pro</span>
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PWA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-xs">
              {language === 'hi' ? 'Android ऐप कंट्रोल & स्क्रीन टाइम' : 'Android App Control & Screen Time'}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Quick Lock Button */}
          <button
            onClick={onOpenQuickLock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-md shadow-rose-950/30 transition cursor-pointer active:scale-95"
            title="Start instant app lockdown"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {language === 'hi' ? 'तुरंत बंद करें' : 'Quick Lock'}
            </span>
          </button>

          {/* Strict Mode Toggle Badge */}
          <button
            onClick={onToggleStrictMode}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              strictMode
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Anti-Cheat Strict Mode"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${strictMode ? 'text-rose-400' : 'text-slate-500'}`} />
            <span>{strictMode ? (language === 'hi' ? 'सख्त PIN मोड' : 'Strict Mode: ON') : (language === 'hi' ? 'सामान्य मोड' : 'Strict: OFF')}</span>
          </button>

          {/* Android Sync Hub Button */}
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
            title="Sync rules to Android Device"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">
              {language === 'hi' ? 'Android सिंक' : 'Android Sync'}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition cursor-pointer"
            title="Change language / भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">{language === 'hi' ? 'EN' : 'हिंदी'}</span>
          </button>

          {/* PWA Install Button (Always prominent) */}
          <PWAInstallButton language={language} />

          {/* Connectivity dot */}
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-amber-400 animate-ping'}`}
            title={isOnline ? 'Online' : 'Offline Cached'}
          />
        </div>

      </div>
    </header>
  );
};
