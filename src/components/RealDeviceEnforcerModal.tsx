import React, { useState } from 'react';
import { AndroidApp } from '../types/app';
import { 
  X, 
  ShieldAlert, 
  Check, 
  Copy, 
  ExternalLink, 
  Download, 
  Smartphone, 
  Zap, 
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { androidEnforcer } from '../utils/androidEnforcer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetApp: AndroidApp | null;
  language: 'hi' | 'en';
}

export const RealDeviceEnforcerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetApp,
  language,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<'macrodroid' | 'shizuku'>('macrodroid');

  if (!isOpen || !targetApp) return null;

  const freezeCommand = androidEnforcer.getFreezeCommand(targetApp.packageName);
  const unfreezeCommand = androidEnforcer.getUnfreezeCommand(targetApp.packageName);
  const shizukuCommand = androidEnforcer.getShizukuCommand(targetApp.packageName, true);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadMacroFile = () => {
    const macroContent = androidEnforcer.generateMacroDroidConfig([targetApp.packageName]);
    const blob = new Blob([macroContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AppLocker_Block_${targetApp.name.replace(/\s+/g, '')}.macro`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>{language === 'hi' ? `${targetApp.name} को फोन पर सच में बंद (Block) करें` : `Enforce Real Android Block: ${targetApp.name}`}</span>
              </h3>
              <p className="text-xs text-rose-300 font-mono">
                {targetApp.packageName}
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

        {/* Why did it open warning explanation */}
        <div className="px-6 pt-4">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {language === 'hi' ? 'फोन पर ऐप क्यों खुला? (कारण व समाधान)' : 'Why did the app open on your phone?'}
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'Google Android सुरक्षा नियमों के कारण कोई भी वेबसाइट या PWA बिना 1-बार परमिशन दिए सीधे फोन के दूसरे ऐप्स को मार/बंद नहीं कर सकता। नीचे दिए गए 2 तरीकों में से कोई 1 तरीका अपनाएं, जिससे Instagram फोन पर खुलना पूरी तरह बंद हो जाएगा!'
                : 'Android OS security sandboxes all browsers. To physically block another native app from opening, enable one of the two standard Android bridges below.'}
            </p>
          </div>
        </div>

        {/* Method Toggle Buttons */}
        <div className="flex border-b border-slate-800 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveMethod('macrodroid')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeMethod === 'macrodroid'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'तरीका 1: MacroDroid ऑटो-क्लोज़र (सबसे आसान)' : 'Method 1: MacroDroid (No-PC, Easiest)'}
            </span>
          </button>

          <button
            onClick={() => setActiveMethod('shizuku')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeMethod === 'shizuku'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'तरीका 2: OS फ्रीज (Shizuku / ADB)' : 'Method 2: OS Freeze (Shizuku/ADB)'}
            </span>
          </button>
        </div>

        {/* Method Details */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-210px)] space-y-4 text-xs">
          
          {activeMethod === 'macrodroid' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300 space-y-2">
                <p className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'hi' ? 'जैसे ही Instagram छुएंगे, तुरंत होम स्क्रीन पर फेंक देगा!' : 'Instantly kills Instagram the millisecond you tap it'}
                </p>
                <p>
                  {language === 'hi'
                    ? 'Android पर MacroDroid ऐप (Play Store पर उपलब्ध) Accessibility परमिशन का उपयोग करता है। जब भी आप Instagram को टच करेंगे, यह 0.1 सेकंड में उसे बंद करके होम स्क्रीन ला देगा।'
                    : 'MacroDroid automatically listens for the app opening, kills the task immediately, and forces the phone back to Home Screen.'}
                </p>
              </div>

              {/* Step by Step Setup */}
              <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-3">
                <p className="font-bold text-slate-200 text-xs">
                  {language === 'hi' ? '2 मिनट में फोन पर सेटअप करें:' : 'Simple 2-Minute Setup:'}
                </p>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-0.5">1</span>
                    <span>
                      {language === 'hi'
                        ? 'Google Play Store से मुफ्त <strong>"MacroDroid"</strong> ऐप डाउनलोड करें।'
                        : 'Install free <strong>MacroDroid</strong> from Google Play Store.'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-0.5">2</span>
                    <div>
                      <span>
                        {language === 'hi'
                          ? 'नीचे दिए गए बटन से इस ऐप की ऑटो-ब्लॉक फ़ाइल डाउनलोड करें और MacroDroid में इम्पोर्ट करें:'
                          : 'Download the auto-block macro file below and open in MacroDroid:'}
                      </span>
                      <div className="mt-2">
                        <button
                          onClick={downloadMacroFile}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
                        >
                          <Download className="w-4 h-4" />
                          <span>{language === 'hi' ? `AppLocker_${targetApp.name}.macro डाउनलोड करें` : `Download ${targetApp.name} Macro`}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-white shrink-0 mt-0.5">3</span>
                    <span>
                      {language === 'hi'
                        ? 'अब जब भी इस PWA में टाइमर चालू होगा और आप फोन पर Instagram खोलेंगे — <strong>वह खुलेगा ही नहीं!</strong>'
                        : 'Now whenever the timer is running in this PWA, tapping Instagram will immediately close it!'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'shizuku' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-slate-300 space-y-2">
                <p className="font-bold text-sm text-rose-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {language === 'hi' ? 'हार्डवेयर OS फ्रीज — ऐप फोन से गायब हो जाएगा!' : 'Android OS Hardware Freeze (Disables the app entirely)'}
                </p>
                <p>
                  {language === 'hi'
                    ? 'Android की `pm disable-user` कमांड से ऐप सिस्टम में पूरी तरह फ्रीज हो जाता है। उसका आइकन इनएक्टिव हो जाता है और खोलने पर Android सिस्टम मना कर देता है।'
                    : 'The `pm disable-user` command deactivates the package in Android OS. The app icon greys out or disappears until enabled.'}
                </p>
              </div>

              {/* ADB command box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-rose-400">
                    {language === 'hi' ? '1. ऐप बंद (Freeze) करने की कमांड:' : 'Lock / Freeze Command:'}
                  </span>
                  <button
                    onClick={() => handleCopy(freezeCommand, 'freeze')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedId === 'freeze' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'freeze' ? 'कॉपी हो गया' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
                  {freezeCommand}
                </pre>
              </div>

              {/* Shizuku on-phone command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-cyan-400">
                    {language === 'hi' ? '2. Shizuku / Termux (फोन में सीधा बिना कंप्यूटर के):' : 'Shizuku / Termux Command (On phone without PC):'}
                  </span>
                  <button
                    onClick={() => handleCopy(shizukuCommand, 'shizuku')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    {copiedId === 'shizuku' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'shizuku' ? 'कॉपी हो गया' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                  {shizukuCommand}
                </pre>
              </div>

              {/* Unfreeze command */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-400">
                    {language === 'hi' ? '3. टाइमर खत्म होने पर ऐप पुनः चालू करने की कमांड:' : 'Unfreeze / Restore Command:'}
                  </span>
                  <button
                    onClick={() => handleCopy(unfreezeCommand, 'unfreeze')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedId === 'unfreeze' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'unfreeze' ? 'कॉपी हो गया' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400 overflow-x-auto whitespace-pre">
                  {unfreezeCommand}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
          >
            {language === 'hi' ? 'समझ गया (Close)' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
