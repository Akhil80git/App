export type AppCategory = 'social' | 'games' | 'entertainment' | 'productivity' | 'browsers' | 'custom';

export type LockStatus = 'active' | 'locked_timer' | 'locked_limit' | 'locked_schedule';

export interface AndroidApp {
  id: string;
  name: string;
  packageName: string;
  category: AppCategory;
  iconBg: string;
  iconName: string;
  isBlocked: boolean; // manually or rule blocked
  dailyLimitMinutes: number; // 0 = unlimited, otherwise limit
  usedTodayMinutes: number;
  lockUntil: number | null; // timestamp ms
  lockReason?: string;
  custom?: boolean;
  isRealFrozen?: boolean; // OS level disabled/frozen
  lastFrozenAt?: number;
}

export interface FocusSession {
  id: string;
  title: string;
  targetAppIds: string[]; // which apps are locked
  startTime: number;
  durationMinutes: number;
  endTime: number;
  isActive: boolean;
  notes?: string;
}

export interface DowntimeSchedule {
  id: string;
  title: string;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // "22:30"
  endTime: string; // "07:00"
  targetAppIds: string[];
  enabled: boolean;
}

export interface AppSettings {
  strictMode: boolean;
  pinCode: string;
  enableNotifications: boolean;
  enableSound: boolean;
  language: 'hi' | 'en';
  requireMathPuzzleToUnlock: boolean;
  enforcementMethod: 'macrodroid_accessibility' | 'adb_shizuku' | 'pwa_watchdog';
  deviceModel?: string;
  isDevicePaired: boolean;
}
