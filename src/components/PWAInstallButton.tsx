import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';

interface Props {
  language: 'hi' | 'en';
}

export const PWAInstallButton: React.FC<Props> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      setShowModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{language === 'hi' ? 'PWA इनस्टॉल है' : 'PWA Installed'}</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Download/Install App directly to Android Home Screen"
      >
        <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
        <span>
          {language === 'hi'
            ? 'PWA डाउनलोड करें'
            : 'Download PWA'}
        </span>
        <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
          APK/PWA
        </span>
      </button>

      {/* Manual / In-Browser PWA installation guidance modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white">
                  {language === 'hi' ? 'Android / ब्राउज़र में इनस्टॉल करें' : 'Install to Home Screen'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi' ? 'बिना प्ले स्टोर के डायरेक्ट PWA ऐप' : 'Standalone Fullscreen Android Experience'}
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-sm">
                <p className="font-semibold text-cyan-400 flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> iOS Safari Steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li>Tap the <strong>Share</strong> button at bottom of Safari.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong> (<PlusSquare className="inline w-3.5 h-3.5" />).</li>
                  <li>Tap <strong>Add</strong> in the top right.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 text-xs text-slate-300">
                <p className="font-semibold text-emerald-400">
                  {language === 'hi' ? 'Android Chrome / Browser में कैसे जोड़ें:' : 'How to install on Android Chrome:'}
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white shrink-0">1</span>
                    <span>
                      {language === 'hi'
                        ? 'ब्राउज़र के ऊपर 3 डॉट्स (⋮) मेनू पर क्लिक करें।'
                        : 'Tap the three-dots (⋮) menu in top right of Chrome/Brave.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white shrink-0">2</span>
                    <span>
                      {language === 'hi'
                        ? '<strong>"Install app"</strong> या <strong>"Add to Home Screen"</strong> चुनें।'
                        : 'Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[11px] text-white shrink-0">3</span>
                    <span>
                      {language === 'hi'
                        ? 'अब यह ऐप आपके Android होम स्क्रीन पर असली ऐप की तरह खुलेगा!'
                        : 'AppLocker Pro will now launch directly from your Android app drawer!'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                {language === 'hi' ? 'समझ गया (Close)' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
