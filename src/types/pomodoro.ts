export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoplayEnabled: boolean;
}

export interface PomodoroStats {
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: string[];
}

export interface PomodoroRuntime {
  sessionType: SessionType;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  targetTimestamp: number | null;
}

export interface RuntimeResolution {
  sessionType: SessionType;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  targetTimestamp: number | null;
  stats: PomodoroStats;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  autoplayEnabled: false,
};

export const DEFAULT_STATS: PomodoroStats = {
  totalSessions: 0,
  totalFocusMinutes: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastSessionDate: null,
  achievements: [],
};

export const RUNTIME_STORAGE_KEY = 'pomme-runtime';
