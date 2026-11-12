import React, { useState } from 'react';
import { AndroidApp } from '../types/app';
import { AppIcon } from './AppIcon';
import { 
  Lock, 
  Unlock, 
  Clock, 
  Timer, 
  AlertTriangle, 
  Sliders, 
  Trash2, 
  Play,
  Calendar
} from 'lucide-react';

interface Props {
  app: AndroidApp;
  onToggleLock: (appId: string) => void;
  onSetDailyLimit: (appId: string, limitMinutes: number) => void;
  onQuickLock: (appId: string, durationMinutes: number) => void;
  onUnlockEarly: (appId: string) => void;
  onTestLaunch: (app: AndroidApp) => void;
  onDeleteCustomApp?: (appId: string) => void;
  language: 'hi' | 'en';
}

export const AppCard: React.FC<Props> = ({
  app,
  onToggleLock,
  onSetDailyLimit,
  onQuickLock,
  onUnlockEarly,
  onTestLaunch,
  onDeleteCustomApp,
  language,
}) => {
  const [showLimitMenu, setShowLimitMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const now = Date.now();
  const isTimeLocked = !!(app.lockUntil && app.lockUntil > now);
  const isLimitLocked = app.dailyLimitMinutes > 0 && app.usedTodayMinutes >= app.dailyLimitMinutes;
  const isCurrentlyBlocked = app.isBlocked || isTimeLocked || isLimitLocked;

  // Calculate remaining time
  const remainingSeconds = isTimeLocked && app.lockUntil ? Math.max(0, Math.floor((app.lockUntil - now) / 1000)) : 0;
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

  // Daily limit progress
  const usagePercent = app.dailyLimitMinutes > 0 ? Math.min(100, Math.round((app.usedTodayMinutes / app.dailyLimitMinutes) * 100)) : 0;

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      isCurrentlyBlocked 
        ? 'bg-slate-900/90 border-rose-500/40 shadow-lg shadow-rose-950/20' 
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
    } p-4 sm:p-5`}>
      {/* Top Banner if Locked */}
      {isTimeLocked && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-3">
        {/* App Icon + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${app.iconBg} flex items-center justify-center shadow-md shrink-0 relative`}>
            <AppIcon iconName={app.iconName} className="w-6 h-6 text-white" />
            {isCurrentlyBlocked && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white">
                <Lock className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-100 text-sm sm:text-base truncate">
                {app.name}
              </h4>
              {app.custom && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                  Custom
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {app.packageName}
            </p>
          </div>
        </div>

        {/* Lock Switch Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (isTimeLocked) {
                onUnlockEarly(app.id);
              } else {
                onToggleLock(app.id);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
              isCurrentlyBlocked
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={isCurrentlyBlocked ? 'Unlock App' : 'Lock App'}
          >
            {isCurrentlyBlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'hi' ? 'बंद है' : 'Locked'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? 'चालू है' : 'Allowed'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lock Status Details */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80">
        {isTimeLocked ? (
          <div className="flex items-center justify-between text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-rose-300">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>
                {language === 'hi' ? 'लॉक रहने का समय शेष:' : 'Locked Remaining:'}
              </span>
              <strong className="font-mono text-rose-200">
                {remainingHours > 0 ? `${remainingHours}h ` : ''}{remainingMinutes}m {remainingSeconds % 60}s
              </strong>
            </div>
            <button
              onClick={() => onUnlockEarly(app.id)}
              className="text-[11px] underline text-rose-300 hover:text-rose-100 font-medium"
            >
              {language === 'hi' ? 'अनलॉक करें' : 'Unlock'}
            </button>
          </div>
        ) : isLimitLocked ? (
          <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {language === 'hi'
                ? `आज की ${app.dailyLimitMinutes} मिनट की सीमा पूरी हो चुकी है। कल सुबह रीसेट होगा।`
                : `Daily ${app.dailyLimitMinutes} min limit exceeded. Locked until midnight.`}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Usage Progress Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {language === 'hi' ? 'आज का उपयोग:' : 'Used today:'}
                <span className="text-slate-200 font-medium">
                  {app.usedTodayMinutes}m {app.dailyLimitMinutes > 0 ? `/ ${app.dailyLimitMinutes}m` : ''}
                </span>
              </span>
              <span className="text-[11px]">
                {app.dailyLimitMinutes > 0 ? `${usagePercent}% limit` : (language === 'hi' ? 'कोई सीमा नहीं' : 'No limit')}
              </span>
            </div>

            {app.dailyLimitMinutes > 0 && (
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 90
                      ? 'bg-rose-500'
                      : usagePercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePercent)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Actions Row */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          {/* Quick Lock Duration Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTimerMenu(!showTimerMenu);
                setShowLimitMenu(false);
              }}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title="Lock this app for a specific duration"
            >
              <Timer className="w-3 h-3 text-cyan-400" />
              <span>{language === 'hi' ? 'समय तय करें' : 'Set Lock Timer'}</span>
            </button>

            {showTimerMenu && (
              <div className="absolute bottom-full left-0 mb-1 z-20 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-2 text-xs space-y-1">
                <p className="font-semibold text-slate-400 px-2 py-0.5 text-[10px]">
                  {language === 'hi' ? 'कितनी देर बंद रखें?' : 'Lock duration:'}
                </p>
                {[15, 30, 45, 60, 120, 240, 480].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onQuickLock(app.id, mins);
                      setShowTimerMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition text-xs flex justify-between items-center"
                  >
                    <span>
                      {mins >= 60 ? `${mins / 60} ${language === 'hi' ? 'घंटा' : 'hours'}` : `${mins} ${language === 'hi' ? 'मिनट' : 'mins'}`}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daily Limit Setter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLimitMenu(!showLimitMenu);
                setShowTimerMenu(false);
              }}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title="Set daily usage limit"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>{language === 'hi' ? 'दैनिक लिमिट' : 'Daily Limit'}</span>
            </button>

            {showLimitMenu && (
              <div className="absolute bottom-full left-0 mb-1 z-20 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-xl p-2 text-xs space-y-1">
                <p className="font-semibold text-slate-400 px-2 py-0.5 text-[10px]">
                  {language === 'hi' ? 'दैनिक स्क्रीन सीमा:' : 'Daily Limit:'}
                </p>
                {[0, 20, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      onSetDailyLimit(app.id, mins);
                      setShowLimitMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 transition text-xs flex justify-between items-center ${
                      app.dailyLimitMinutes === mins ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <span>
                      {mins === 0
                        ? (language === 'hi' ? 'अनलिमिटेड' : 'Unlimited')
                        : (mins >= 60 ? `${mins / 60} ${language === 'hi' ? 'घंटे/दिन' : 'hours/day'}` : `${mins} ${language === 'hi' ? 'मिनट/दिन' : 'mins/day'}`)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action icons: Simulate Android Launch & Delete */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTestLaunch(app)}
            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
            title="Simulate opening this app on Android"
          >
            <Play className="w-3 h-3" />
            <span>{language === 'hi' ? 'टेस्ट करें' : 'Test Launch'}</span>
          </button>

          {app.custom && onDeleteCustomApp && (
            <button
              onClick={() => onDeleteCustomApp(app.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Remove app"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
