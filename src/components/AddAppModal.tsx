import React, { useState } from 'react';
import { AndroidApp, AppCategory } from '../types/app';
import { X, Plus, Package } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddApp: (app: AndroidApp) => void;
  language: 'hi' | 'en';
}

const CATEGORIES: { id: AppCategory; labelEn: string; labelHi: string }[] = [
  { id: 'social', labelEn: 'Social Media', labelHi: 'सोशल मीडिया' },
  { id: 'games', labelEn: 'Games', labelHi: 'गेम्स' },
  { id: 'entertainment', labelEn: 'Entertainment', labelHi: 'मनोरंजन' },
  { id: 'browsers', labelEn: 'Web Browser', labelHi: 'ब्राउज़र' },
  { id: 'productivity', labelEn: 'Productivity', labelHi: 'काम / प्रोडक्टिविटी' },
  { id: 'custom', labelEn: 'Other Apps', labelHi: 'अन्य' },
];

export const AddAppModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddApp,
  language,
}) => {
  const [name, setName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [category, setCategory] = useState<AppCategory>('games');
  const [dailyLimit, setDailyLimit] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedPackage = packageName.trim() || `com.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.android`;

    const newApp: AndroidApp = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      packageName: formattedPackage,
      category,
      iconBg: 'from-violet-600 to-indigo-700',
      iconName: 'Package',
      isBlocked: false,
      dailyLimitMinutes: dailyLimit,
      usedTodayMinutes: 0,
      lockUntil: null,
      custom: true,
    };

    onAddApp(newApp);
    setName('');
    setPackageName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {language === 'hi' ? 'नया Android ऐप जोड़ें' : 'Add Custom Android App'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'किसी भी ऐप का नाम और पैकेज जोड़कर कंट्रोल करें'
                  : 'Add any app or game installed on your phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'hi' ? 'ऐप का नाम:' : 'App Name:'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Candy Crush, Discord, Ludo King"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!packageName) {
                  setPackageName(`com.${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}.android`);
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'hi' ? 'Android पैकेज नाम (Package Name):' : 'Package Name:'}
            </label>
            <input
              type="text"
              placeholder="e.g. com.king.candycrushsaga"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              {language === 'hi'
                ? 'Play Store के URL में `id=` के बाद आने वाला नाम।'
                : 'Android package identifier (found in Play Store URL id=)'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'hi' ? 'श्रेणी (Category):' : 'Category:'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AppCategory)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'hi' ? c.labelHi : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {language === 'hi' ? 'दैनिक समय सीमा (मिनट):' : 'Daily Usage Limit (Minutes):'}
            </label>
            <input
              type="number"
              min="0"
              max="720"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              0 = {language === 'hi' ? 'कोई दैनिक सीमा नहीं' : 'Unlimited'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-xs shadow-md"
            >
              {language === 'hi' ? 'ऐप जोड़ें' : 'Add App'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
