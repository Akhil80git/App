import React from 'react';
import { AndroidApp } from '../types/app';
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Award, 
  Zap, 
  CheckCircle2, 
  BarChart3,
  Sparkles
} from 'lucide-react';

interface Props {
  apps: AndroidApp[];
  language: 'hi' | 'en';
}

export const AnalyticsTab: React.FC<Props> = ({ apps, language }) => {
  const currentlyLockedCount = apps.filter(
    (a) => a.isBlocked || (a.lockUntil && a.lockUntil > Date.now()) || (a.dailyLimitMinutes > 0 && a.usedTodayMinutes >= a.dailyLimitMinutes)
  ).length;

  const totalUsedMinutes = apps.reduce((acc, curr) => acc + curr.usedTodayMinutes, 0);
  const totalSavedMinutes = Math.max(140, 360 - totalUsedMinutes); // baseline 6h average phone usage

  const savedHours = Math.floor(totalSavedMinutes / 60);
  const savedRemainderMins = totalSavedMinutes % 60;

  // Breakdown by category
  const categories = [
    { id: 'social', labelEn: 'Social Media', labelHi: 'सोशल मीडिया', color: 'from-pink-500 to-rose-500' },
    { id: 'entertainment', labelEn: 'Entertainment', labelHi: 'मनोरंजन (YT/Reels)', color: 'from-red-500 to-amber-500' },
    { id: 'games', labelEn: 'Mobile Games', labelHi: 'मोबाइल गेम्स', color: 'from-amber-500 to-orange-500' },
    { id: 'browsers', labelEn: 'Browsers', labelHi: 'ब्राउज़र्स', color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {language === 'hi' ? 'आज बचाया गया समय' : 'Time Saved Today'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {savedHours}h {savedRemainderMins}m
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{language === 'hi' ? '+35% कल से बेहतर फोकस' : '+35% better than yesterday'}</span>
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {language === 'hi' ? 'वर्तमान में बंद ऐप्स' : 'Apps Blocked'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {currentlyLockedCount} <span className="text-sm font-normal text-slate-400">/ {apps.length}</span>
          </div>
          <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-medium">
            <span>{language === 'hi' ? 'डिटॉक्स नियंत्रण सक्रिय' : 'Detox control active'}</span>
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {language === 'hi' ? 'फोकस स्ट्रीक (दिन)' : 'Focus Streak'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            7 <span className="text-sm font-normal text-slate-400">{language === 'hi' ? 'दिन' : 'Days'}</span>
          </div>
          <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-medium">
            <Award className="w-3 h-3" />
            <span>{language === 'hi' ? 'गोल्डन अनुशासन बैच' : 'Golden Discipline badge'}</span>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">
              {language === 'hi' ? 'अनुशासन स्कोर' : 'Compliance Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            94%
          </div>
          <p className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>{language === 'hi' ? 'शीर्ष 5% डिजिटल डिटॉक्स' : 'Top 5% focused users'}</span>
          </p>
        </div>

      </div>

      {/* Usage vs Limit Category Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">
              {language === 'hi' ? 'श्रेणी अनुसार स्क्रीन समय और सीमा' : 'Category Usage & Limiting Distribution'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {language === 'hi' ? 'लाइव मॉनिटरिंग' : 'Live Sync'}
          </span>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const catApps = apps.filter((a) => a.category === cat.id);
            const used = catApps.reduce((acc, c) => acc + c.usedTodayMinutes, 0);
            const limit = catApps.reduce((acc, c) => acc + c.dailyLimitMinutes, 0) || 120;
            const pct = Math.min(100, Math.round((used / limit) * 100));

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">
                    {language === 'hi' ? cat.labelHi : cat.labelEn}
                    <span className="text-slate-500 ml-1.5">({catApps.length} apps)</span>
                  </span>
                  <span className="font-mono text-slate-300">
                    {used}m <span className="text-slate-500">/ {limit}m limit</span> ({pct}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Tips for Android Digital Wellbeing */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-5 sm:p-6">
        <h4 className="font-bold text-sm text-indigo-300 flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          {language === 'hi' ? 'Android डिटॉक्स के लिए महत्वपूर्ण टिप्स' : 'Actionable Digital Wellbeing Strategies'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 mt-3">
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <strong className="text-white block mb-0.5">
              {language === 'hi' ? '1. रात 10:30 से शेड्यूल चालू करें' : '1. Schedule Night Bedtime Lock'}
            </strong>
            <span>
              {language === 'hi'
                ? 'सोने से पहले सोशल मीडिया को ऑटो-ब्लॉक करने से नींद 40% गहरी होती है।'
                : 'Nightly auto-locks prevent late-night dopamine loops and insomnia.'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <strong className="text-white block mb-0.5">
              {language === 'hi' ? '2. सख्त एंटी-चीट चालू रखें' : '2. Enable Strict Anti-Cheat'}
            </strong>
            <span>
              {language === 'hi'
                ? '15-सेकंड का विराम और गणित का सवाल जल्दबाजी में ऐप खोलने से रोकता है।'
                : 'The reflection timer curbs automatic thumb memory and impulsivity.'}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
