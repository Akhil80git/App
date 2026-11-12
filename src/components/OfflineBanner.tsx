import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

interface Props {
  language: 'hi' | 'en';
}

export const OfflineBanner: React.FC<Props> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-amber-400/30">
      <div className="p-1 rounded-lg bg-black/20 shrink-0">
        <WifiOff className="w-4 h-4 text-amber-100 animate-pulse" />
      </div>
      <div>
        <p className="font-semibold text-white leading-tight">
          {language === 'hi' ? 'ऑफ़लाइन मोड (Offline Mode)' : 'Offline Mode Active'}
        </p>
        <p className="text-[11px] text-amber-100/90 leading-tight">
          {language === 'hi'
            ? 'PWA कैश्ड है — ऐप लॉक और सभी टाइमर बिना इंटरनेट के चालू रहेंगे।'
            : 'Cached offline — all timers and lock policies operate locally.'}
        </p>
      </div>
    </div>
  );
};
