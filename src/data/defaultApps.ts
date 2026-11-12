import { AndroidApp } from '../types/app';

// Default initial apps list starts completely EMPTY so no unwanted fake apps are forced on the user
export const INITIAL_ANDROID_APPS: AndroidApp[] = [];

// Reference catalog used ONLY when user chooses to pick apps from the scanner
export const SUGGESTED_ANDROID_APPS = [
  {
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social' as const,
    iconBg: 'from-pink-500 via-rose-500 to-amber-500',
    iconName: 'Instagram',
    dailyLimitMinutes: 45,
  },
  {
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    category: 'social' as const,
    iconBg: 'from-emerald-500 to-emerald-600',
    iconName: 'MessageSquare',
    dailyLimitMinutes: 90,
  },
  {
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'entertainment' as const,
    iconBg: 'from-red-600 to-red-700',
    iconName: 'Youtube',
    dailyLimitMinutes: 60,
  },
  {
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    category: 'browsers' as const,
    iconBg: 'from-yellow-500 via-green-500 to-blue-500',
    iconName: 'Compass',
    dailyLimitMinutes: 120,
  },
  {
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    category: 'social' as const,
    iconBg: 'from-blue-600 to-blue-700',
    iconName: 'Facebook',
    dailyLimitMinutes: 30,
  },
  {
    name: 'Snapchat',
    packageName: 'com.snapchat.android',
    category: 'social' as const,
    iconBg: 'from-yellow-400 to-amber-500',
    iconName: 'Camera',
    dailyLimitMinutes: 25,
  },
  {
    name: 'Shorts & Reels',
    packageName: 'com.zhiliaoapp.musically',
    category: 'entertainment' as const,
    iconBg: 'from-slate-900 to-cyan-500',
    iconName: 'Film',
    dailyLimitMinutes: 20,
  },
  {
    name: 'Telegram',
    packageName: 'org.telegram.messenger',
    category: 'social' as const,
    iconBg: 'from-sky-500 to-blue-600',
    iconName: 'Send',
    dailyLimitMinutes: 60,
  },
];
