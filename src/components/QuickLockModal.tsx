import React, { useState } from 'react';
import { AndroidApp } from '../types/app';
import { AppIcon } from './AppIcon';
import { 
  X, 
  Timer, 
  ShieldAlert, 
  Check, 
  Sparkles, 
  Clock, 
  Flame, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  apps: AndroidApp[];
  isOpen: boolean;
  onClose: () => void;
  onStartLockdown: (selectedAppIds: string[], durationMinutes: number, title: string) => void;
  language: 'hi' | 'en';
}

const PRESET_DURATIONS = [
  { mins: 15, labelEn: '15 Mins', labelHi: '15 मिनट', desc: 'Short Break' },
  { mins: 30, labelEn: '30 Mins', labelHi: '30 मिनट', desc: 'Deep Focus' },
  { mins: 45, labelEn: '45 Mins', labelHi: '45 मिनट', desc: 'Pomodoro' },
  { mins: 60, labelEn: '1 Hour', labelHi: '1 घंटा', desc: 'Study Session' },
  { mins: 120, labelEn: '2 Hours', labelHi: '2 घंटे', desc: 'Work Sprint' },
  { mins: 240, labelEn: '4 Hours', labelHi: '4 घंटे', desc: 'Digital Detox' },
  { mins: 480, labelEn: '8 Hours', labelHi: '8 घंटे', desc: 'Bedtime / Full Lock' },
];

export const QuickLockModal: React.FC<Props> = ({
  apps,
  isOpen,
  onClose,
  onStartLockdown,
  language,
}) => {
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(
    apps.filter(a => a.category === 'social' || a.category === 'games').map(a => a.id)
  );
  const [selectedMinutes, setSelectedMinutes] = useState<number>(60);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Deep Work Focus');

  if (!isOpen) return null;

  const toggleSelectApp = (id: string) => {
    setSelectedAppIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedAppIds.length === apps.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(apps.map(a => a.id));
    }
  };

  const selectCategory = (category: string) => {
    const ids = apps.filter(a => a.category === category).map(a => a.id);
    setSelectedAppIds(Array.from(new Set([...selectedAppIds, ...ids])));
  };

  const finalDuration = useCustom ? (parseInt(customMinutes, 10) || 30) : selectedMinutes;

  const handleStart = () => {
    if (selectedAppIds.length === 0) return;
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
    onStartLockdown(selectedAppIds, finalDuration, sessionTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {language === 'hi' ? 'तुरंत ऐप बंद (Lockdown) करें' : 'Instant App Lockdown'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'तय करें कौन से ऐप्स और कितनी देर तक पूरी तरह बंद रहेंगे'
                  : 'Choose apps and set how long they remain completely blocked'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Step 1: Select Duration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {language === 'hi' ? '1. बंद रखने का समय (Duration) चुनें' : '1. Select Lock Duration'}
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {finalDuration >= 60 ? `${(finalDuration / 60).toFixed(1)} hrs` : `${finalDuration} mins`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_DURATIONS.map((preset) => {
                const isSelected = !useCustom && selectedMinutes === preset.mins;
                return (
                  <button
                    key={preset.mins}
                    type="button"
                    onClick={() => {
                      setSelectedMinutes(preset.mins);
                      setUseCustom(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-600/30 to-emerald-600/20 border-cyan-400 text-white shadow-md shadow-cyan-900/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <p className="font-bold text-sm">
                      {language === 'hi' ? preset.labelHi : preset.labelEn}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</p>
                  </button>
                );
              })}

              {/* Custom input button */}
              <div
                onClick={() => setUseCustom(true)}
                className={`p-2.5 rounded-2xl border flex flex-col justify-center transition-all cursor-pointer ${
                  useCustom
                    ? 'bg-gradient-to-br from-cyan-600/30 to-emerald-600/20 border-cyan-400'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <span className="text-[11px] font-medium text-slate-300 mb-1">
                  {language === 'hi' ? 'कस्टम मिनट:' : 'Custom (Mins):'}
                </span>
                <input
                  type="number"
                  placeholder="e.g. 90"
                  min="5"
                  max="1440"
                  value={customMinutes}
                  onChange={(e) => {
                    setUseCustom(true);
                    setCustomMinutes(e.target.value);
                  }}
                  onFocus={() => setUseCustom(true)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Select Apps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                {language === 'hi' ? '2. कौन-कौन से ऐप्स बंद करने हैं?' : '2. Select Apps to Block'}
                <span className="text-white font-mono ml-1">({selectedAppIds.length}/{apps.length})</span>
              </label>

              {/* Quick Filters */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 transition"
                >
                  {selectedAppIds.length === apps.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>{language === 'hi' ? 'सभी ऐप्स' : 'All'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectCategory('social')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  Social
                </button>
                <button
                  type="button"
                  onClick={() => selectCategory('games')}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  Games
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {apps.map((app) => {
                const isChecked = selectedAppIds.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleSelectApp(app.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      isChecked
                        ? 'bg-rose-500/15 border-rose-500/50 text-white'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.iconBg} flex items-center justify-center shrink-0`}>
                        <AppIcon iconName={app.iconName} className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate text-slate-100">{app.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{app.packageName}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                      isChecked ? 'bg-rose-500 text-white' : 'border border-slate-600'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Title / Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'hi' ? 'लॉकडाउन का उद्देश्य / नाम:' : 'Lockdown Title / Purpose:'}
            </label>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="e.g. Study exam prep, Bedtime sleep, Deep focus sprint"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Footer / Submit */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? `${selectedAppIds.length} ऐप्स को ${finalDuration} मिनट के लिए बंद किया जाएगा`
              : `Locking ${selectedAppIds.length} apps for ${finalDuration} minutes`}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleStart}
              disabled={selectedAppIds.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 transition shadow-lg ${
                selectedAppIds.length === 0
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 hover:opacity-95 cursor-pointer shadow-rose-950/40 active:scale-95'
              }`}
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>{language === 'hi' ? 'अभी लॉकडाउन चालू करें' : 'Start Lockdown'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
