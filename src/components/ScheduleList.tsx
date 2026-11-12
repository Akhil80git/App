import React from 'react';
import { DowntimeSchedule, AndroidApp } from '../types/app';
import { AppIcon } from './AppIcon';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Moon, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  schedules: DowntimeSchedule[];
  apps: AndroidApp[];
  onToggleSchedule: (id: string) => void;
  onDeleteSchedule: (id: string) => void;
  onOpenCreate: () => void;
  language: 'hi' | 'en';
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const ScheduleList: React.FC<Props> = ({
  schedules,
  apps,
  onToggleSchedule,
  onDeleteSchedule,
  onOpenCreate,
  language,
}) => {
  // Check if schedule is active right now
  const isScheduleActiveNow = (schedule: DowntimeSchedule) => {
    if (!schedule.enabled) return false;
    const now = new Date();
    const currentDay = now.getDay();
    if (!schedule.days.includes(currentDay)) return false;

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight (e.g. 22:30 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white">
            {language === 'hi' ? 'ऑटोमैटिक ऐप बंद समय सारणी (Schedules)' : 'Automated Downtime Schedules'}
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'तय समय पर चयनित ऐप्स अपने-आप बंद रहेंगे और काम के बाद ही खुलेंगे'
              : 'Apps automatically lock during recurring school, bedtime, or work windows'}
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नया शेड्यूल' : 'New Schedule'}</span>
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
          <Moon className="w-10 h-10 text-indigo-400 mx-auto" />
          <h4 className="font-semibold text-sm text-slate-200">
            {language === 'hi' ? 'कोई सक्रिय शेड्यूल नहीं है' : 'No schedules configured yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'hi'
              ? 'जैसे रात 10:30 से सुबह 7:00 तक सोशल मीडिया बंद रखना।'
              : 'Add bedtime or work focus schedules to automatically block distraction apps.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            {language === 'hi' ? 'पहला शेड्यूल बनाएं' : 'Create First Schedule'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((schedule) => {
            const isActive = isScheduleActiveNow(schedule);
            const targetApps = apps.filter((a) => schedule.targetAppIds.includes(a.id));

            return (
              <div
                key={schedule.id}
                className={`p-4 sm:p-5 rounded-2xl border transition ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-white">
                        {schedule.title}
                      </h4>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                          {language === 'hi' ? 'अभी एक्टिव है (Locked)' : 'ACTIVE NOW'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{schedule.startTime} — {schedule.endTime}</span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleSchedule(schedule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        schedule.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Schedule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Days tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                    const isDaySelected = schedule.days.includes(dayIndex);
                    return (
                      <span
                        key={dayIndex}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          isDaySelected
                            ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {language === 'hi' ? DAY_NAMES_HI[dayIndex] : DAY_NAMES_EN[dayIndex]}
                      </span>
                    );
                  })}
                </div>

                {/* Target App icons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {language === 'hi'
                      ? `${targetApps.length} ऐप्स बंद रहेंगे`
                      : `${targetApps.length} Apps Controlled:`}
                  </span>
                  <div className="flex items-center -space-x-1.5">
                    {targetApps.slice(0, 5).map((app) => (
                      <div
                        key={app.id}
                        className={`w-6 h-6 rounded-md bg-gradient-to-br ${app.iconBg} flex items-center justify-center border border-slate-900 shadow-xs`}
                        title={app.name}
                      >
                        <AppIcon iconName={app.iconName} className="w-3.5 h-3.5 text-white" />
                      </div>
                    ))}
                    {targetApps.length > 5 && (
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center border border-slate-900">
                        +{targetApps.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
