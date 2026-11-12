import React, { useState } from 'react';
import { AndroidApp } from '../types/app';
import { AppIcon } from './AppIcon';
import { 
  X, 
  Smartphone, 
  Search, 
  Check, 
  Trash2, 
  Usb, 
  FileText, 
  RefreshCw, 
  Sparkles,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { androidEnforcer } from '../utils/androidEnforcer';
import { soundEffects } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentApps: AndroidApp[];
  onApplyAppsList: (apps: AndroidApp[]) => void;
  language: 'hi' | 'en';
}

// Database of popular Android apps that might be installed on the user's phone
const ANDROID_APPS_CATALOG: Omit<AndroidApp, 'id' | 'isBlocked' | 'lockUntil' | 'usedTodayMinutes'>[] = [
  { name: 'Instagram', packageName: 'com.instagram.android', category: 'social', iconBg: 'from-pink-500 via-rose-500 to-amber-500', iconName: 'Instagram', dailyLimitMinutes: 45 },
  { name: 'WhatsApp', packageName: 'com.whatsapp', category: 'social', iconBg: 'from-emerald-500 to-emerald-600', iconName: 'MessageSquare', dailyLimitMinutes: 90 },
  { name: 'YouTube', packageName: 'com.google.android.youtube', category: 'entertainment', iconBg: 'from-red-600 to-red-700', iconName: 'Youtube', dailyLimitMinutes: 60 },
  { name: 'Google Chrome', packageName: 'com.android.chrome', category: 'browsers', iconBg: 'from-yellow-500 via-green-500 to-blue-500', iconName: 'Compass', dailyLimitMinutes: 120 },
  { name: 'Facebook', packageName: 'com.facebook.katana', category: 'social', iconBg: 'from-blue-600 to-blue-700', iconName: 'Facebook', dailyLimitMinutes: 30 },
  { name: 'Snapchat', packageName: 'com.snapchat.android', category: 'social', iconBg: 'from-yellow-400 to-amber-500', iconName: 'Camera', dailyLimitMinutes: 25 },
  { name: 'Telegram', packageName: 'org.telegram.messenger', category: 'social', iconBg: 'from-sky-500 to-blue-600', iconName: 'Send', dailyLimitMinutes: 60 },
  { name: 'BGMI / PUBG Mobile', packageName: 'com.pubg.imobile', category: 'games', iconBg: 'from-amber-600 to-orange-700', iconName: 'Gamepad2', dailyLimitMinutes: 30 },
  { name: 'Free Fire MAX', packageName: 'com.dts.freefiremax', category: 'games', iconBg: 'from-orange-500 to-red-600', iconName: 'Flame', dailyLimitMinutes: 30 },
  { name: 'Shorts & Reels (TikTok)', packageName: 'com.zhiliaoapp.musically', category: 'entertainment', iconBg: 'from-slate-900 to-cyan-500', iconName: 'Film', dailyLimitMinutes: 20 },
  { name: 'Netflix', packageName: 'com.netflix.ninja', category: 'entertainment', iconBg: 'from-red-700 to-zinc-950', iconName: 'Tv', dailyLimitMinutes: 60 },
  { name: 'X (Twitter)', packageName: 'com.twitter.android', category: 'social', iconBg: 'from-zinc-800 to-black', iconName: 'Hash', dailyLimitMinutes: 30 },
  { name: 'Amazon Prime Video', packageName: 'com.amazon.avod.thirdpartyclient', category: 'entertainment', iconBg: 'from-sky-600 to-blue-900', iconName: 'Tv', dailyLimitMinutes: 60 },
  { name: 'Ludo King', packageName: 'com.ludo.king', category: 'games', iconBg: 'from-amber-500 to-red-500', iconName: 'Gamepad2', dailyLimitMinutes: 30 },
  { name: 'Candy Crush Saga', packageName: 'com.king.candycrushsaga', category: 'games', iconBg: 'from-pink-500 to-purple-600', iconName: 'Gamepad2', dailyLimitMinutes: 30 },
  { name: 'Call of Duty Mobile', packageName: 'com.activision.callofduty.shooter', category: 'games', iconBg: 'from-zinc-700 to-zinc-900', iconName: 'Gamepad2', dailyLimitMinutes: 45 },
  { name: 'Hotstar / Disney+', packageName: 'in.startv.hotstar', category: 'entertainment', iconBg: 'from-blue-700 to-indigo-900', iconName: 'Tv', dailyLimitMinutes: 60 },
  { name: 'Brave Browser', packageName: 'com.brave.browser', category: 'browsers', iconBg: 'from-orange-500 to-amber-600', iconName: 'Compass', dailyLimitMinutes: 90 },
];

export const AppScannerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentApps,
  onApplyAppsList,
  language,
}) => {
  const [activeMode, setActiveMode] = useState<'pick' | 'usb' | 'paste'>('pick');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Selected packages for user's actual phone
  const [selectedPackages, setSelectedPackages] = useState<string[]>(() => {
    return currentApps.map((a) => a.packageName);
  });

  // WebUSB scanning state
  const [usbScanning, setUsbScanning] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState<string | null>(null);
  const [usbStatusMsg, setUsbStatusMsg] = useState('');

  // Paste raw text state
  const [rawText, setRawText] = useState('');

  if (!isOpen) return null;

  const togglePackage = (pkg: string) => {
    setSelectedPackages((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
  };

  const handleClearAll = () => {
    setSelectedPackages([]);
  };

  const handleSelectCommonFive = () => {
    setSelectedPackages([
      'com.instagram.android',
      'com.whatsapp',
      'com.google.android.youtube',
      'com.android.chrome',
    ]);
  };

  // Connect via WebUSB
  const handleConnectUSB = async () => {
    setUsbScanning(true);
    setUsbStatusMsg(language === 'hi' ? 'फोन खोजा जा रहा है...' : 'Scanning for Android device...');
    
    const result = await androidEnforcer.requestDeviceConnection();
    setUsbScanning(false);

    if (result.success && result.deviceName) {
      setUsbDeviceName(result.deviceName);
      setUsbStatusMsg(
        language === 'hi' 
          ? `कनेक्ट हो गया: ${result.deviceName}! पैकेज लिस्ट लोड की जा रही है...` 
          : `Connected: ${result.deviceName}! Reading real installed packages...`
      );
      soundEffects.playSuccess();
    } else {
      setUsbStatusMsg(result.error || (language === 'hi' ? 'कनेक्ट नहीं हो पाया।' : 'Failed to connect.'));
    }
  };

  // Parse raw pasted package list
  const handleParsePasted = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split(/[\r\n, ]+/).map((l) => l.trim().replace(/^package:/, '')).filter(Boolean);
    const valid = lines.filter((l) => l.includes('.'));
    if (valid.length > 0) {
      setSelectedPackages(Array.from(new Set([...selectedPackages, ...valid])));
      setActiveMode('pick');
      soundEffects.playSuccess();
    }
  };

  // Save selected packages as the active apps list
  const handleApply = () => {
    const finalApps: AndroidApp[] = selectedPackages.map((pkg) => {
      // Find catalog match or create clean custom app
      const existing = currentApps.find((a) => a.packageName === pkg);
      if (existing) return existing;

      const catalogMatch = ANDROID_APPS_CATALOG.find((c) => c.packageName === pkg);
      if (catalogMatch) {
        return {
          id: `app_${pkg.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: catalogMatch.name,
          packageName: catalogMatch.packageName,
          category: catalogMatch.category,
          iconBg: catalogMatch.iconBg,
          iconName: catalogMatch.iconName,
          isBlocked: false,
          dailyLimitMinutes: catalogMatch.dailyLimitMinutes,
          usedTodayMinutes: 0,
          lockUntil: null,
        };
      }

      // Deriving name from package name (e.g. com.example.app -> App)
      const parts = pkg.split('.');
      const derivedName = parts[parts.length - 1]
        ? parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1)
        : pkg;

      return {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: derivedName,
        packageName: pkg,
        category: 'custom',
        iconBg: 'from-violet-600 to-indigo-700',
        iconName: 'Package',
        isBlocked: false,
        dailyLimitMinutes: 30,
        usedTodayMinutes: 0,
        lockUntil: null,
        custom: true,
      };
    });

    onApplyAppsList(finalApps);
    soundEffects.playSuccess();
    onClose();
  };

  const filteredCatalog = ANDROID_APPS_CATALOG.filter(
    (app) =>
      app.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {language === 'hi' ? 'फोन के असली ऐप्स चुनें / स्कैन करें' : 'Select Apps Present On Your Phone'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'पहले से तय कोई गैर-ज़रूरी ऐप नहीं रहेगा — केवल वही ऐप्स दिखेंगे जो आपके मोबाइल में हैं'
                  : 'Remove unwanted preloaded apps and keep only what is actually installed'}
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-900/50">
          <button
            onClick={() => setActiveMode('pick')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'pick'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? '1-क्लिक ऐप चयन' : 'Check Installed Apps'} ({selectedPackages.length})
            </span>
          </button>

          <button
            onClick={() => setActiveMode('usb')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'usb'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Usb className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'USB / OTG ऑटो-स्कैन' : 'WebUSB / OTG Scan'}</span>
          </button>

          <button
            onClick={() => setActiveMode('paste')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeMode === 'paste'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पैकेज लिस्ट पेस्ट करें' : 'Paste Package Names'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-170px)] space-y-4">
          
          {activeMode === 'pick' && (
            <div className="space-y-4">
              
              {/* Quick Actions & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'सर्च करें (Instagram, WhatsApp, आदि)...' : 'Search app or package...'}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <button
                    onClick={handleSelectCommonFive}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                  >
                    {language === 'hi' ? 'सिर्फ मुख्य ऐप्स (Top 4)' : 'Top 4 Apps'}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{language === 'hi' ? 'सभी हटाएं (Clear All)' : 'Clear All'}</span>
                  </button>
                </div>
              </div>

              {/* Instructions Banner */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-300 flex items-center justify-between">
                <span>
                  {language === 'hi'
                    ? 'नीचे उन ऐप्स पर टिक (✓) लगाएं जो सच में आपके फोन में इनस्टॉल हैं:'
                    : 'Check only the apps currently installed on your physical smartphone:'}
                </span>
                <span className="font-mono text-emerald-400 font-bold ml-2">
                  {selectedPackages.length} {language === 'hi' ? 'चुने गए' : 'selected'}
                </span>
              </div>

              {/* App Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredCatalog.map((app) => {
                  const isChecked = selectedPackages.includes(app.packageName);
                  return (
                    <div
                      key={app.packageName}
                      onClick={() => togglePackage(app.packageName)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${app.iconBg} flex items-center justify-center shrink-0`}>
                          <AppIcon iconName={app.iconName} className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate text-slate-100">{app.name}</p>
                          <p className="text-[10px] text-slate-400 truncate font-mono">{app.packageName}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                        isChecked ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {activeMode === 'usb' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                  <Usb className="w-4 h-4" />
                  {language === 'hi' ? 'WebUSB से सीधा फोन स्कैन करें' : 'Direct Phone Hardware Scan (WebUSB)'}
                </p>
                <p>
                  {language === 'hi'
                    ? 'अगर आप Android फोन को OTG केबल या कंप्यूटर से कनेक्ट करते हैं, तो यह सीधे फोन के सभी इनस्टॉल किए गए थर्ड-पार्टी ऐप्स (`pm list packages -3`) को लाइव पढ़ सकता है।'
                    : 'Connect your phone with OTG or to your PC. The browser can query Android OS directly for all installed third-party apps.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center space-y-3">
                <button
                  onClick={handleConnectUSB}
                  disabled={usbScanning}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
                >
                  {usbScanning ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {language === 'hi' ? 'डिवाइस से कनेक्ट हो रहा है...' : 'Connecting...'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Usb className="w-4 h-4" />
                      {language === 'hi' ? 'Android डिवाइस कनेक्ट करें (WebUSB)' : 'Pair Android Device'}
                    </span>
                  )}
                </button>

                {usbStatusMsg && (
                  <p className="text-xs font-mono text-cyan-300">{usbStatusMsg}</p>
                )}
              </div>
            </div>
          )}

          {activeMode === 'paste' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                {language === 'hi'
                  ? 'अपने फोन के पैकेज नाम पेस्ट करें (एक लाइन में एक या कॉमा लगाकर):'
                  : 'Paste package names (one per line or comma-separated):'}
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="com.instagram.android&#10;com.whatsapp&#10;com.google.android.youtube"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleParsePasted}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                {language === 'hi' ? 'लिस्ट जोड़ें (Parse & Add)' : 'Import Pasted Packages'}
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {language === 'hi'
              ? `${selectedPackages.length} ऐप्स डैशबोर्ड में दिखाए जाएंगे`
              : `${selectedPackages.length} apps will be shown on dashboard`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md transition hover:opacity-95"
            >
              {language === 'hi' ? 'डैशबोर्ड में सेव करें' : 'Apply My Phone Apps'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
