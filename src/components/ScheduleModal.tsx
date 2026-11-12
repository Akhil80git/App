import React, { useState } from 'react';
import { AndroidApp, DowntimeSchedule } from '../types/app';
import { AppIcon } from './AppIcon';
import { X, Calendar, Clock, Check, Moon, BookOpen, Briefcase, Plus } from 'lucide-react';

interface Props {
  apps: AndroidApp[];
  isOpen: boolean;
  onClose: () => void;
  onSaveSchedule: (schedule: Omit<DowntimeSchedule, 'id'>) => void;
  language: 'hi' | 'en';
}

const DAYS_MAP = [
  { day: 0, labelEn: 'Sun', labelHi: 'रवि' },
  { day: 1, labelEn: 'Mon', labelHi: 'सोम' },
  { day: 2, labelEn: 'Tue', labelHi: 'मंगल' },
  { day: 3, labelEn: 'Wed', labelHi: 'बुध' },
  { day: 4, labelEn: 'Thu', labelHi: 'गुरु' },
  { day: 5, labelEn: 'Fri', labelHi: 'शुक्र' },
  { day: 6, labelEn: 'Sat', labelHi: 'शनि' },
];

export const ScheduleModal: React.FC<Props> = ({
  apps,
  isOpen,
  onClose,
  onSaveSchedule,
  language,
}) => {
  const [title, setTitle] = useState('Night Bedtime Detox');
  const [startTime, setStartTime] = useState('22:30');
  const [endTime, setEndTime] = useState('07:00');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // all days
  const [targetAppIds, setTargetAppIds] = useState<string[]>(
    apps.filter(a => a.category === 'social' || a.category === 'entertainment').map(a => a.id)
  );

  if (!isOpen) return null;

  const toggleDay = (d: number) => {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const toggleApp = (id: string) => {
    setTargetAppIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const applyTemplate = (type: 'sleep' | 'study' | 'work') => {
    if (type === 'sleep') {
      setTitle(language === 'hi' ? 'रात का सोने का समय (Bedtime)' : 'Night Bedtime Detox');
      setStartTime('22:30');
      setEndTime('07:00');
      setDays([0, 1, 2, 3, 4, 5, 6]);
      setTargetAppIds(apps.map(a => a.id));
    } else if (type === 'study') {
      setTitle(language === 'hi' ? 'पढ़ाई / कोचिंग का समय' : 'Study & Focus Hours');
      setStartTime('15:00');
      setEndTime('18:00');
      setDays([1, 2, 3, 4, 5, 6]);
      setTargetAppIds(apps.filter(a => a.category === 'social' || a.category === 'games').map(a => a.id));
    } else if (type === 'work') {
      setTitle(language === 'hi' ? 'ऑफिस / काम का समय' : 'Workday Focus Hours');
      setStartTime('09:30');
      setEndTime('17:30');
      setDays([1, 2, 3, 4, 5]);
      setTargetAppIds(apps.filter(a => a.category === 'social' || a.category === 'games' || a.category === 'entertainment').map(a => a.id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAppIds.length === 0 || days.length === 0) return;
    onSaveSchedule({
      title,
      startTime,
      endTime,
      days,
      targetAppIds,
      enabled: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {language === 'hi' ? 'नया ऑटोमैटिक शेड्यूल बनाएं' : 'Create Automated Schedule'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi'
                  ? 'तय समय पर चुने गए ऐप्स अपने-आप बंद हो जाएंगे'
                  : 'Apps will automatically lock during this active recurring window'}
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

        {/* Templates */}
        <div className="px-6 pt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => applyTemplate('sleep')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs border border-purple-500/30 transition shrink-0"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सोने का समय (Night)' : 'Night Bedtime'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('study')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-cyan-500/30 transition shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'पढ़ाई (Study)' : 'Study Time'}</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('work')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-emerald-500/30 transition shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'ऑफिस / काम' : 'Work Focus'}</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-170px)]">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'hi' ? 'शेड्यूल का नाम:' : 'Schedule Name:'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Time pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {language === 'hi' ? 'कब बंद शुरू होगा:' : 'Start Locking At:'}
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'hi' ? 'कब खुलेगा (समाप्त):' : 'End Locking At:'}
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
          </div>

          {/* Days selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'hi' ? 'किन दिनों दोहराना है:' : 'Repeat On Days:'}
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_MAP.map((item) => {
                const isSelected = days.includes(item.day);
                return (
                  <button
                    key={item.day}
                    type="button"
                    onClick={() => toggleDay(item.day)}
                    className={`py-2 rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apps to block in this schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'hi'
                ? `कौन से ऐप्स बंद रहेंगे (${targetAppIds.length} चुने गए):`
                : `Blocked Apps (${targetAppIds.length} selected):`}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {apps.map((app) => {
                const isSelected = targetAppIds.includes(app.id);
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleApp(app.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${app.iconBg} flex items-center justify-center shrink-0`}>
                        <AppIcon iconName={app.iconName} className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs truncate">{app.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition shadow-lg shadow-indigo-950/40"
            >
              {language === 'hi' ? 'शेड्यूल सेव करें' : 'Save Schedule'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
