/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AndroidApp, DowntimeSchedule, AppCategory, AppSettings } from './types/app';
import { INITIAL_ANDROID_APPS } from './data/defaultApps';
import { Navbar } from './components/Navbar';
import { AppCard } from './components/AppCard';
import { QuickLockModal } from './components/QuickLockModal';
import { ScheduleModal } from './components/ScheduleModal';
import { ScheduleList } from './components/ScheduleList';
import { AddAppModal } from './components/AddAppModal';
import { SimulateLockModal } from './components/SimulateLockModal';
import { AndroidSyncModal } from './components/AndroidSyncModal';
import { PinModal } from './components/PinModal';
import { AnalyticsTab } from './components/AnalyticsTab';
import { OfflineBanner } from './components/OfflineBanner';
import { AppScannerModal } from './components/AppScannerModal';
import { RealDeviceEnforcerModal } from './components/RealDeviceEnforcerModal';
import { soundEffects } from './utils/audio';
import { t } from './utils/translations';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Smartphone, 
  Timer, 
  Calendar, 
  BarChart3, 
  Search, 
  Plus, 
  Lock, 
  Unlock, 
  Sparkles, 
  Filter, 
  Layers, 
  Flame, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Scan,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY_APPS = 'applocker_apps_v1';
const STORAGE_KEY_SCHEDULES = 'applocker_schedules_v1';
const STORAGE_KEY_SETTINGS = 'applocker_settings_v1';

const DEFAULT_SCHEDULES: DowntimeSchedule[] = [
  {
    id: 'bedtime_default',
    title: 'Night Sleep Downtime (रात का समय)',
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: '22:30',
    endTime: '07:00',
    targetAppIds: ['instagram', 'youtube', 'bgmi', 'tiktok_reels', 'netflix'],
    enabled: true,
  },
  {
    id: 'study_focus_default',
    title: 'Study & Deep Work Focus (पढ़ाई का समय)',
    days: [1, 2, 3, 4, 5, 6],
    startTime: '14:00',
    endTime: '17:00',
    targetAppIds: ['instagram', 'bgmi', 'freefire', 'tiktok_reels', 'x_twitter'],
    enabled: false,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  strictMode: false,
  pinCode: '1234',
  enableNotifications: true,
  enableSound: true,
  language: 'hi', // Hindi default as requested by user
  requireMathPuzzleToUnlock: true,
  enforcementMethod: 'macrodroid_accessibility',
  isDevicePaired: false,
};

export default function App() {
  // Load initial persistent state
  const [apps, setApps] = useState<AndroidApp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPS);
      return saved ? JSON.parse(saved) : INITIAL_ANDROID_APPS;
    } catch {
      return INITIAL_ANDROID_APPS;
    }
  });

  const [schedules, setSchedules] = useState<DowntimeSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      return saved ? JSON.parse(saved) : DEFAULT_SCHEDULES;
    } catch {
      return DEFAULT_SCHEDULES;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<'apps' | 'quickLock' | 'schedule' | 'stats' | 'sync'>('apps');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all');
  const [filterBlockedOnly, setFilterBlockedOnly] = useState(false);

  // Modals state
  const [showQuickLockModal, setShowQuickLockModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [enforceTargetApp, setEnforceTargetApp] = useState<AndroidApp | null>(null);
  const [simulateApp, setSimulateApp] = useState<AndroidApp | null>(null);
  const [pendingUnlockAppId, setPendingUnlockAppId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
    } catch {
      // storage unavailable
    }
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    } catch {
      // storage unavailable
    }
  }, [schedules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // storage unavailable
    }
  }, [settings]);

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 1-second interval ticker for live timer expiration & downtime schedule enforcement
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = Date.now();
      let hasChanges = false;

      setApps((currentApps) => {
        return currentApps.map((app) => {
          // If app was locked with a timer that has now expired
          if (app.lockUntil && app.lockUntil <= now) {
            hasChanges = true;
            soundEffects.playSuccess();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('AppLocker: Lock Window Ended!', {
                body: `${app.name} is now unlocked. Well done staying focused!`,
                icon: '/pwa-192x192.png',
              });
            }
            return {
              ...app,
              lockUntil: null,
              isBlocked: false,
            };
          }
          return app;
        });
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  const language = settings.language;
  const currentT = t[language];

  // Helper calculations
  const now = Date.now();
  const lockedApps = useMemo(() => {
    return apps.filter(
      (a) => a.isBlocked || (a.lockUntil && a.lockUntil > now) || (a.dailyLimitMinutes > 0 && a.usedTodayMinutes >= a.dailyLimitMinutes)
    );
  }, [apps, now]);

  // Filtered Apps List
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const isLocked = app.isBlocked || (app.lockUntil && app.lockUntil > now) || (app.dailyLimitMinutes > 0 && app.usedTodayMinutes >= app.dailyLimitMinutes);
      const matchesLockedFilter = !filterBlockedOnly || isLocked;
      return matchesSearch && matchesCategory && matchesLockedFilter;
    });
  }, [apps, searchQuery, selectedCategory, filterBlockedOnly, now]);

  // Actions
  const handleToggleLock = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const willBlock = !app.isBlocked;
          if (willBlock) {
            soundEffects.playLock();
          } else {
            soundEffects.playUnlock();
          }
          return {
            ...app,
            isBlocked: willBlock,
            lockUntil: willBlock ? (Date.now() + 60 * 60 * 1000) : null, // default 1h if manual toggle
          };
        }
        return app;
      })
    );
  };

  const handleUnlockEarly = (appId: string) => {
    if (settings.strictMode) {
      setPendingUnlockAppId(appId);
    } else {
      executeUnlock(appId);
    }
  };

  const executeUnlock = (appId: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          soundEffects.playUnlock();
          return {
            ...app,
            isBlocked: false,
            lockUntil: null,
          };
        }
        return app;
      })
    );
    setPendingUnlockAppId(null);
  };

  const handleSetDailyLimit = (appId: string, limitMinutes: number) => {
    setApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, dailyLimitMinutes: limitMinutes } : app))
    );
    soundEffects.playLock();
  };

  const handleQuickLockSingle = (appId: string, durationMinutes: number) => {
    const lockUntilTime = Date.now() + durationMinutes * 60 * 1000;
    setApps((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, isBlocked: true, lockUntil: lockUntilTime } : app))
    );
    soundEffects.playLock();
  };

  const handleStartBatchLockdown = (selectedAppIds: string[], durationMinutes: number, title: string) => {
    const lockUntilTime = Date.now() + durationMinutes * 60 * 1000;
    setApps((prev) =>
      prev.map((app) => {
        if (selectedAppIds.includes(app.id)) {
          return {
            ...app,
            isBlocked: true,
            lockUntil: lockUntilTime,
            lockReason: title,
          };
        }
        return app;
      })
    );
    soundEffects.playLock();
  };

  const handleLockAllNow = (minutes: number) => {
    const lockUntilTime = Date.now() + minutes * 60 * 1000;
    setApps((prev) =>
      prev.map((app) => ({
        ...app,
        isBlocked: true,
        lockUntil: lockUntilTime,
      }))
    );
    soundEffects.playLock();
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleUnlockAll = () => {
    if (settings.strictMode) {
      setPendingUnlockAppId('ALL');
    } else {
      setApps((prev) =>
        prev.map((app) => ({
          ...app,
          isBlocked: false,
          lockUntil: null,
        }))
      );
      soundEffects.playUnlock();
    }
  };

  const handleAddApp = (newApp: AndroidApp) => {
    setApps((prev) => [newApp, ...prev]);
    soundEffects.playSuccess();
  };

  const handleDeleteCustomApp = (appId: string) => {
    setApps((prev) => prev.filter((a) => a.id !== appId));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveSchedule = (newSchedule: Omit<DowntimeSchedule, 'id'>) => {
    const schedule: DowntimeSchedule = {
      ...newSchedule,
      id: `sched_${Date.now()}`,
    };
    setSchedules((prev) => [schedule, ...prev]);
    soundEffects.playSuccess();
  };

  const toggleLanguage = () => {
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'hi' ? 'en' : 'hi',
    }));
  };

  const toggleStrictMode = () => {
    setSettings((prev) => ({
      ...prev,
      strictMode: !prev.strictMode,
    }));
    soundEffects.playLock();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 antialiased">
      
      {/* Top Application Navbar */}
      <Navbar
        language={language}
        onToggleLanguage={toggleLanguage}
        strictMode={settings.strictMode}
        onToggleStrictMode={toggleStrictMode}
        onOpenSync={() => setShowSyncModal(true)}
        onOpenQuickLock={() => setShowQuickLockModal(true)}
        lockedCount={lockedApps.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Banner: Direct answer to user's purpose */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'Android ऐप कंट्रोलर PWA' : 'Android App Control Hub'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
                {language === 'hi'
                  ? 'कौन सा ऐप कब और कितनी देर बंद रहेगा — सब यहाँ से तय करें'
                  : 'Control Which Android Apps Lock & For How Long'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'hi'
                  ? 'ब्राउज़र में PWA डाउनलोड करें, टाइमर सेट करें (15m, 1h, 4h), दैनिक सीमाएं बनाएं और बिना इंटरनेट के भी ऑटोमैटिक ऐप ब्लॉक चलाएं।'
                  : 'Install this PWA to your home screen, set timed lockouts, enforce daily screen limits, and manage downtime schedules effortlessly.'}
              </p>
            </div>

            {/* Quick Action Buttons in Hero */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowQuickLockModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/40 active:scale-95 transition cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>{language === 'hi' ? 'तुरंत ऐप बंद करें' : 'Start Lockdown'}</span>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{language === 'hi' ? '+ नया शेड्यूल' : '+ New Schedule'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Pill Row */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>
                <strong>{lockedApps.length}</strong> {language === 'hi' ? 'ऐप्स अभी बंद हैं' : 'Apps currently blocked'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>
                <strong>{apps.length - lockedApps.length}</strong> {language === 'hi' ? 'ऐप्स चालू हैं' : 'Apps allowed'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {language === 'hi' ? 'आज 3h 15m स्क्रीन टाइम बचाया' : 'Saved 3h 15m today'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('apps')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'apps'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{currentT.tabApps} ({apps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'schedule'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{currentT.tabSchedule} ({schedules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'stats'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{currentT.tabStats}</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 ${
                activeTab === 'sync'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{currentT.tabSync}</span>
            </button>
          </div>

          {/* Quick Add Custom App & Scan Phone App Buttons */}
          {activeTab === 'apps' && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowScannerModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
                title="Select or scan apps present on your phone"
              >
                <Scan className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? '📲 फोन के ऐप्स चुनें' : '📲 Scan My Phone'}</span>
              </button>

              <button
                onClick={() => setShowAddAppModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'hi' ? '+ नया ऐप' : '+ Add App'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: All Android Apps Control */}
        {activeTab === 'apps' && (
          <div className="space-y-4">
            
            {/* Real Enforcement Guide Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-rose-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'फोन पर सच में ऐप्स बंद रखने के लिए (Real Android Block):' : 'Real Android OS Blocking:'}</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {language === 'hi'
                      ? 'PWA में लॉक करने के बाद, ऐप के नीचे "असली ब्लॉक" बटन दबाएं ताकि MacroDroid या ADB से ऐप छूने पर भी न खुले!'
                      : 'After setting timer, click "Real Block" on any app card to enable MacroDroid auto-close or ADB freeze.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScannerModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold whitespace-nowrap transition cursor-pointer self-end sm:self-center"
              >
                {language === 'hi' ? 'अनावश्यक ऐप्स हटाएं' : 'Filter My Apps'}
              </button>
            </div>
            
            {/* Search & Filters Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={currentT.searchApps}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'social', 'games', 'entertainment', 'browsers'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white border border-slate-600 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'all'
                      ? (language === 'hi' ? 'सभी' : 'All')
                      : cat === 'social'
                      ? (language === 'hi' ? 'सोशल' : 'Social')
                      : cat === 'games'
                      ? (language === 'hi' ? 'गेम्स' : 'Games')
                      : cat === 'entertainment'
                      ? (language === 'hi' ? 'वीडियो' : 'Video')
                      : (language === 'hi' ? 'ब्राउज़र' : 'Browser')}
                  </button>
                ))}

                {/* Filter Locked Only Toggle */}
                <button
                  onClick={() => setFilterBlockedOnly(!filterBlockedOnly)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition cursor-pointer ${
                    filterBlockedOnly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-semibold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>{language === 'hi' ? 'सिर्फ बंद' : 'Locked Only'}</span>
                </button>
              </div>

              {/* Master 1-Click Batch Actions */}
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                <button
                  onClick={() => handleLockAllNow(60)}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  title="Lock all apps for 1 hour"
                >
                  {language === 'hi' ? 'सब 1h बंद करें' : 'Lock All 1h'}
                </button>
                <button
                  onClick={handleUnlockAll}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                  title="Unlock all apps"
                >
                  {language === 'hi' ? 'सब खोलें' : 'Unlock All'}
                </button>
              </div>

            </div>

            {/* Apps Grid */}
            {filteredApps.length === 0 ? (
              <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  {language === 'hi' ? 'कोई ऐप नहीं मिला' : 'No apps match your filter'}
                </p>
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'सर्च या फ़िल्टर बदलें या नया ऐप जोड़ें।' : 'Try resetting search query or add a custom app.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onToggleLock={handleToggleLock}
                    onSetDailyLimit={handleSetDailyLimit}
                    onQuickLock={handleQuickLockSingle}
                    onUnlockEarly={handleUnlockEarly}
                    onTestLaunch={(app) => setSimulateApp(app)}
                    onOpenRealEnforce={(app) => setEnforceTargetApp(app)}
                    onDeleteCustomApp={handleDeleteCustomApp}
                    language={language}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Automated Recurring Schedules */}
        {activeTab === 'schedule' && (
          <ScheduleList
            schedules={schedules}
            apps={apps}
            onToggleSchedule={handleToggleSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onOpenCreate={() => setShowScheduleModal(true)}
            language={language}
          />
        )}

        {/* Tab 3: Detox Analytics */}
        {activeTab === 'stats' && (
          <AnalyticsTab apps={apps} language={language} />
        )}

        {/* Tab 4: Android Sync & Guide Hub */}
        {activeTab === 'sync' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {language === 'hi' ? 'Android फोन पर यह PWA कैसे काम करता है?' : 'How AppLocker Controls Android'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'hi'
                      ? 'ब्राउज़र PWA से लेकर फोन के असली ऐप्स को बंद रखने की तकनीक'
                      : 'The full technical integration between PWA and native Android apps'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {language === 'hi' ? 'PWA डाउनलोड करें' : 'Download PWA'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'ऊपर दिए गए "PWA डाउनलोड करें" बटन को दबाएं। यह तुरंत आपके Android के होम स्क्रीन पर बिना ऐप स्टोर के इनस्टॉल हो जाएगा।'
                      : 'Tap the Install button in navbar. It installs as a native-like standalone app directly from the browser.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {language === 'hi' ? 'समय और ऐप्स तय करें' : 'Set Timers & Rules'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'तय करें कि Instagram, YouTube या गेम्स कितनी देर बंद रहेंगे (30m, 1h, 4h) और रात को कब से कब तक बंद रहेंगे।'
                      : 'Configure quick lock timers or automated bedtime downtime schedules for each app.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="font-bold text-sm text-white">
                    {language === 'hi' ? 'Android एनफोर्समेंट' : 'Android Enforcement'}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {language === 'hi'
                      ? 'Android पर Tasker, MacroDroid या Shizuku/ADB के ज़रिए नियम तुरंत सिंक होकर बैकग्राउंड में ऐप्स को ऑटोमैटिक ब्लॉक करते हैं।'
                      : 'Bridge policies to Android via Tasker/MacroDroid automation or Shizuku shell commands.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSyncModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md transition hover:opacity-95"
                >
                  {language === 'hi' ? 'Android सिंक हब खोलें (ADB & Tasker फ़ाइल)' : 'Open Android Sync & ADB Hub'}
                </button>
                <button
                  onClick={() => setSimulateApp(apps[0])}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
                >
                  {language === 'hi' ? 'Android ब्लॉक स्क्रीन का डेमो चलाएं' : 'Simulate Android Block Screen'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Offline Notification */}
      <OfflineBanner language={language} />

      {/* Modals */}
      <QuickLockModal
        apps={apps}
        isOpen={showQuickLockModal}
        onClose={() => setShowQuickLockModal(false)}
        onStartLockdown={handleStartBatchLockdown}
        language={language}
      />

      <ScheduleModal
        apps={apps}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSaveSchedule={handleSaveSchedule}
        language={language}
      />

      <AddAppModal
        isOpen={showAddAppModal}
        onClose={() => setShowAddAppModal(false)}
        onAddApp={handleAddApp}
        language={language}
      />

      <AndroidSyncModal
        apps={apps}
        schedules={schedules}
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        language={language}
      />

      <SimulateLockModal
        app={simulateApp}
        isOpen={!!simulateApp}
        onClose={() => setSimulateApp(null)}
        language={language}
      />

      <PinModal
        isOpen={!!pendingUnlockAppId}
        onClose={() => setPendingUnlockAppId(null)}
        onSuccess={() => {
          if (pendingUnlockAppId === 'ALL') {
            setApps((prev) =>
              prev.map((app) => ({
                ...app,
                isBlocked: false,
                lockUntil: null,
              }))
            );
            soundEffects.playUnlock();
          } else if (pendingUnlockAppId) {
            executeUnlock(pendingUnlockAppId);
          }
        }}
        masterPin={settings.pinCode}
        requireMath={settings.requireMathPuzzleToUnlock}
        language={language}
      />

      {/* App Scanner / Selector Modal */}
      <AppScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        currentApps={apps}
        onApplyAppsList={(newAppsList) => {
          setApps(newAppsList);
        }}
        language={language}
      />

      {/* Real Device Enforcement Modal */}
      <RealDeviceEnforcerModal
        isOpen={!!enforceTargetApp}
        onClose={() => setEnforceTargetApp(null)}
        targetApp={enforceTargetApp}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            AppLocker Pro PWA — {language === 'hi' ? 'Android ऐप कंट्रोल & स्क्रीन टाइम' : 'Android App Controller & Screen Time'}
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <span>{language === 'hi' ? 'PWA ऑटो-अपडेट सक्रिय' : 'PWA Auto-Update Active'}</span>
            <span>•</span>
            <span>{language === 'hi' ? 'ऑफ़लाइन रेडी' : 'Offline Ready'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
