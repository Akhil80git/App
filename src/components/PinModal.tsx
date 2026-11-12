import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, KeyRound, Brain, AlertCircle } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterPin: string;
  requireMath: boolean;
  language: 'hi' | 'en';
}

export const PinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  masterPin,
  requireMath,
  language,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [mathProblem, setMathProblem] = useState({ q: '24 + 37', a: 61 });
  const [mathAnswer, setMathAnswer] = useState('');
  const [cooldown, setCooldown] = useState(15);
  const [cooldownDone, setCooldownDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Generate new math problem
    const num1 = Math.floor(Math.random() * 40) + 15;
    const num2 = Math.floor(Math.random() * 40) + 12;
    setMathProblem({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setCooldown(15);
    setCooldownDone(false);
    setPin('');
    setMathAnswer('');
    setError('');

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCooldownDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requireMath && parseInt(mathAnswer, 10) !== mathProblem.a) {
      setError(language === 'hi' ? 'गलत गणित उत्तर! कृपया पुनः गणना करें।' : 'Incorrect calculation answer!');
      soundEffects.playWarning();
      return;
    }

    if (pin !== masterPin && pin !== '1234') {
      setError(language === 'hi' ? 'गलत मास्टर PIN! डिफ़ॉल्ट पिन 1234 है।' : 'Incorrect Master PIN (Default: 1234)');
      soundEffects.playWarning();
      return;
    }

    soundEffects.playUnlock();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">
            {language === 'hi' ? 'सख्त सुरक्षा (Anti-Cheat) सुरक्षा' : 'Strict Mode Protection'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'hi'
              ? 'समय से पहले ऐप अनलॉक करने के लिए खुद को चुनौती दें'
              : 'Prevent impulsive unlocks and verify your discipline'}
          </p>
        </div>

        {/* 15s Cooldown Pause */}
        {!cooldownDone ? (
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-center mb-4">
            <p className="text-xs text-slate-300 mb-1">
              {language === 'hi' ? '15 सेकंड का विराम (Deep Breath):' : 'Impulse Pause Reflection:'}
            </p>
            <div className="text-2xl font-mono font-bold text-cyan-400">
              00:{cooldown.toString().padStart(2, '0')}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {language === 'hi' ? 'क्या आपको सच में अभी इस ऐप की जरूरत है?' : 'Take a moment. Is this distraction really necessary?'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {requireMath && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'hi' ? `सवाल हल करें: ${mathProblem.q} = ?` : `Solve: ${mathProblem.q} = ?`}
                </label>
                <input
                  type="number"
                  required
                  placeholder="Answer"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                {language === 'hi' ? 'मास्टर पिन (Default: 1234)' : 'Master PIN (Default: 1234)'}
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full tracking-widest text-center text-lg font-mono bg-slate-800 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs shadow-md transition"
            >
              {language === 'hi' ? 'अनलॉक की पुष्टि करें' : 'Confirm Early Unlock'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
