import React, { useState } from 'react';
import { AndroidApp, DowntimeSchedule } from '../types/app';
import { 
  X, 
  Smartphone, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  QrCode, 
  Cpu, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Settings
} from 'lucide-react';

interface Props {
  apps: AndroidApp[];
  schedules: DowntimeSchedule[];
  isOpen: boolean;
  onClose: () => void;
  language: 'hi' | 'en';
}

export const AndroidSyncModal: React.FC<Props> = ({
  apps,
  schedules,
  isOpen,
  onClose,
  language,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'automate' | 'adb' | 'json'>('automate');

  if (!isOpen) return null;

  const lockedApps = apps.filter(a => a.isBlocked || (a.lockUntil && a.lockUntil > Date.now()));

  // Generate ADB Shell commands
  const adbCommands = lockedApps.length > 0 
    ? lockedApps.map(a => `adb shell pm disable-user --user 0 ${a.packageName}`).join('\n')
    : apps.slice(0, 3).map(a => `adb shell pm disable-user --user 0 ${a.packageName}`).join('\n');

  const adbUnfreezeCommands = apps.map(a => `adb shell pm enable ${a.packageName}`).join('\n');

  // Generate Tasker / MacroDroid JSON configuration
  const automationConfig = {
    version: '2.0-pwa',
    generatedAt: new Date().toISOString(),
    lockedPackages: lockedApps.map(a => a.packageName),
    allAppRules: apps.map(a => ({
      name: a.name,
      package: a.packageName,
      isBlocked: a.isBlocked,
      lockUntil: a.lockUntil,
      dailyLimitMinutes: a.dailyLimitMinutes,
    })),
    schedules: schedules.filter(s => s.enabled),
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadJsonConfig = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(automationConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'applocker-android-rules.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
              <h3 className="font-bold text-lg text-white">
                {language === 'hi' ? 'Android डिवाइस सिंक और कंट्रोल हब' : 'Android Sync & Enforcement Hub'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'PWA के नियमों को अपने Android फोन में लागू करने के तरीके'
                  : 'Bridge PWA rules directly to Android OS app enforcement'}
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('automate')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'automate'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'Tasker / MacroDroid ऑटोमेशन' : 'Tasker & MacroDroid'}</span>
          </button>
          <button
            onClick={() => setActiveTab('adb')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'adb'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'ADB / Shizuku कमांड्स' : 'ADB / Shizuku Shell'}</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'JSON नियम फ़ाइल' : 'Rulebook JSON'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-170px)] text-xs text-slate-300">
          
          {activeTab === 'automate' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-emerald-400 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {language === 'hi' ? '1-क्लिक Android ऑटोमेशन (बिना रूट के)' : 'Zero-Root Android App Blocker'}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? 'Android पर MacroDroid या Tasker ऐप के साथ यह PWA सीधे लिंक हो जाता है। जब भी आप इस PWA में किसी ऐप को बंद करते हैं, यह नियम फ़ाइल MacroDroid को बता देती है कि ऐप खुलते ही तुरंत बंद कर दिया जाए!'
                    : 'Use Tasker or MacroDroid on Android. When any locked app is opened during this focus window, it automatically closes the app and displays the block screen.'}
                </p>
              </div>

              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <p className="font-semibold text-slate-200">
                  {language === 'hi' ? 'कदम 1: ऑटोमेशन नियम डाउनलोड करें' : 'Step 1: Download Configuration'}
                </p>
                <button
                  onClick={downloadJsonConfig}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:opacity-95 transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'hi' ? 'Android नियम फ़ाइल (.json) डाउनलोड करें' : 'Download applocker-rules.json'}</span>
                </button>
              </div>

              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-2">
                <p className="font-semibold text-slate-200">
                  {language === 'hi' ? 'कदम 2: MacroDroid / Tasker में सेट करें:' : 'Step 2: Configure in MacroDroid:'}
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Trigger: <strong>App Launched</strong> (Select Instagram, YouTube, etc.)</li>
                  <li>Action: <strong>Kill Background Process</strong> or <strong>Launch Home Screen</strong></li>
                  <li>Action 2: <strong>Display Notification</strong>: "App Locked by AppLocker PWA"</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'adb' && (
            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-cyan-400 mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {language === 'hi' ? 'ADB Shell / Shizuku से सीधा ऐप फ्रीज (Freeze)' : 'Hardware Freeze via ADB / Shizuku'}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? 'अगर आप ऐप को पूरी तरह से डिसेबल/गायब करना चाहते हैं ताकि फोन पर खुले ही नहीं, तो यह कमांड चलाएं:'
                    : 'Running these commands will completely disable the apps on Android OS level until unfrozen:'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-rose-400">
                    {language === 'hi' ? 'ऐप्स बंद (Freeze) करने की कमांड्स:' : 'Disable / Freeze Commands:'}
                  </span>
                  <button
                    onClick={() => handleCopy(adbCommands, 'adb-lock')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {copiedSection === 'adb-lock' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'adb-lock' ? 'कॉपी हो गया' : 'Copy All'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
                  {adbCommands}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {language === 'hi' ? 'समय पूरा होने पर ऐप्स पुनः चालू (Unfreeze) करने की कमांड्स:' : 'Unfreeze / Enable Commands:'}
                  </span>
                  <button
                    onClick={() => handleCopy(adbUnfreezeCommands, 'adb-unlock')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    {copiedSection === 'adb-unlock' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'adb-unlock' ? 'कॉपी हो गया' : 'Copy All'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre max-h-28">
                  {adbUnfreezeCommands}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'hi' ? 'वर्तमान PWA लॉक नीति JSON:' : 'Live App Policy JSON:'}
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(automationConfig, null, 2), 'json')}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  {copiedSection === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'json' ? 'कॉपी हो गया' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto max-h-72">
                {JSON.stringify(automationConfig, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
