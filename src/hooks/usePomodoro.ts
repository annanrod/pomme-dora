import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n';
import beepSound from '@/assets/beep.mp3';
import notificationSound from '@/assets/notification.mp3';
import { useLocalStorage } from './useLocalStorage';

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  soundEnabled: boolean;
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

interface PomodoroRuntime {
  sessionType: SessionType;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  targetTimestamp: number | null;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  autoplayEnabled: false,
};

const DEFAULT_STATS: PomodoroStats = {
  totalSessions: 0,
  totalFocusMinutes: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastSessionDate: null,
  achievements: [],
};

const DAY_IN_MS = 86400000;
const RUNTIME_STORAGE_KEY = 'pomme-runtime';

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseStoredSessionDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getStreakFromLastSession(lastSessionDate: string | null, currentStreak: number, todayKey: string) {
  if (!lastSessionDate) return 1;

  const today = new Date(`${todayKey}T00:00:00`);
  const lastSession = parseStoredSessionDate(lastSessionDate);
  const diffInDays = Math.round((today.getTime() - lastSession.getTime()) / DAY_IN_MS);

  if (diffInDays <= 0) return currentStreak;
  if (diffInDays === 1) return currentStreak + 1;
  return 1;
}

function getDurationForSession(sessionType: SessionType, settings: PomodoroSettings) {
  if (sessionType === 'focus') return settings.focusMinutes * 60;
  if (sessionType === 'shortBreak') return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function readStoredRuntime() {
  try {
    const raw = localStorage.getItem(RUNTIME_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PomodoroRuntime>;

    if (
      parsed.sessionType !== 'focus' &&
      parsed.sessionType !== 'shortBreak' &&
      parsed.sessionType !== 'longBreak'
    ) {
      return null;
    }

    if (
      typeof parsed.timeLeft !== 'number' ||
      typeof parsed.isRunning !== 'boolean' ||
      typeof parsed.sessionsCompleted !== 'number'
    ) {
      return null;
    }

    return {
      sessionType: parsed.sessionType,
      timeLeft: Math.max(0, Math.floor(parsed.timeLeft)),
      isRunning: parsed.isRunning,
      sessionsCompleted: Math.max(0, Math.floor(parsed.sessionsCompleted)),
      targetTimestamp: typeof parsed.targetTimestamp === 'number' ? parsed.targetTimestamp : null,
    } satisfies PomodoroRuntime;
  } catch {
    return null;
  }
}

export function usePomodoro() {
  const { t } = useI18n();
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomme-settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<PomodoroStats>('pomme-stats', DEFAULT_STATS);
  
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const cycleAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountdownBeepRef = useRef<number | null>(null);
  const targetTimestampRef = useRef<number | null>(null);
  const previousSettingsRef = useRef(settings);
  const previousSessionTypeRef = useRef(sessionType);
  const hasRestoredRuntimeRef = useRef(false);

  const totalTime = sessionType === 'focus'
    ? settings.focusMinutes * 60
    : sessionType === 'shortBreak'
    ? settings.shortBreakMinutes * 60
    : settings.longBreakMinutes * 60;

  const progress = 1 - timeLeft / totalTime;

  useEffect(() => {
    cycleAudioRef.current = new Audio(notificationSound);
    cycleAudioRef.current.preload = 'auto';
    beepAudioRef.current = new Audio(beepSound);
    beepAudioRef.current.preload = 'auto';
    beepAudioRef.current.volume = 0.35;

    return () => {
      cycleAudioRef.current = null;
      beepAudioRef.current = null;
    };
  }, []);

  const playCountdownBeep = useCallback(() => {
    if (!beepAudioRef.current) return;

    beepAudioRef.current.currentTime = 0;
    void beepAudioRef.current.play().catch(() => {
      // Browser autoplay restrictions can still block playback in some cases.
    });
  }, []);

  const getMotivationalMessage = useCallback(() => {
    return t.notifications.motivational[Math.floor(Math.random() * t.notifications.motivational.length)];
  }, [t.notifications.motivational]);

  const checkAchievements = useCallback((newStats: PomodoroStats) => {
    const achievements = [...newStats.achievements];
    if (newStats.totalSessions >= 1 && !achievements.includes('first_session')) {
      achievements.push('first_session');
    }
    if (newStats.totalSessions >= 10 && !achievements.includes('ten_sessions')) {
      achievements.push('ten_sessions');
    }
    if (newStats.totalSessions >= 50 && !achievements.includes('fifty_sessions')) {
      achievements.push('fifty_sessions');
    }
    if (newStats.currentStreak >= 3 && !achievements.includes('three_streak')) {
      achievements.push('three_streak');
    }
    if (newStats.currentStreak >= 7 && !achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }
    if (newStats.totalFocusMinutes >= 60 && !achievements.includes('one_hour')) {
      achievements.push('one_hour');
    }
    if (newStats.totalFocusMinutes >= 600 && !achievements.includes('ten_hours')) {
      achievements.push('ten_hours');
    }
    return achievements;
  }, []);

  useEffect(() => {
    if (hasRestoredRuntimeRef.current) return;

    const storedRuntime = readStoredRuntime();
    hasRestoredRuntimeRef.current = true;

    if (!storedRuntime) return;

    const fallbackDuration = getDurationForSession(storedRuntime.sessionType, settings);
    const nextTimeLeft = storedRuntime.isRunning && storedRuntime.targetTimestamp
      ? Math.max(0, Math.ceil((storedRuntime.targetTimestamp - Date.now()) / 1000))
      : Math.min(storedRuntime.timeLeft, fallbackDuration);

    setSessionType(storedRuntime.sessionType);
    setSessionsCompleted(storedRuntime.sessionsCompleted);
    setTimeLeft(nextTimeLeft);
    targetTimestampRef.current = storedRuntime.isRunning ? storedRuntime.targetTimestamp : null;
    setIsRunning(Boolean(storedRuntime.isRunning && storedRuntime.targetTimestamp && nextTimeLeft > 0));
  }, [settings]);

  useEffect(() => {
    try {
      const runtime: PomodoroRuntime = {
        sessionType,
        timeLeft,
        isRunning,
        sessionsCompleted,
        targetTimestamp: targetTimestampRef.current,
      };
      localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(runtime));
    } catch {
      // Ignore persistence failures.
    }
  }, [sessionType, timeLeft, isRunning, sessionsCompleted]);

  const completeSession = useCallback(() => {
    targetTimestampRef.current = null;
    lastCountdownBeepRef.current = null;

    if (sessionType === 'focus') {
      const todayKey = getTodayKey();
      setStats(prev => {
        const newStreak = getStreakFromLastSession(prev.lastSessionDate, prev.currentStreak, todayKey);
        const newStats: PomodoroStats = {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalFocusMinutes: prev.totalFocusMinutes + settings.focusMinutes,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          lastSessionDate: todayKey,
          achievements: prev.achievements,
        };
        newStats.achievements = checkAchievements(newStats);
        return newStats;
      });

      const newCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newCompleted);

      const nextSessionType: SessionType = newCompleted % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      const nextTimeLeft = getDurationForSession(nextSessionType, settings);

      setSessionType(nextSessionType);
      setTimeLeft(nextTimeLeft);

      if (settings.autoplayEnabled) {
        targetTimestampRef.current = Date.now() + nextTimeLeft * 1000;
      }

    } else {
      const nextTimeLeft = settings.focusMinutes * 60;
      setSessionType('focus');
      setTimeLeft(nextTimeLeft);

      if (settings.autoplayEnabled) {
        targetTimestampRef.current = Date.now() + nextTimeLeft * 1000;
      }
    }
    setIsRunning(settings.autoplayEnabled);
    lastCountdownBeepRef.current = null;

    if (settings.soundEnabled && cycleAudioRef.current) {
      cycleAudioRef.current.currentTime = 0;
      void cycleAudioRef.current.play().catch(() => {
        // Browser autoplay restrictions can block playback until the user interacts.
      });
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      const title = sessionType === 'focus' ? t.notifications.focusCompleteTitle : t.notifications.breakCompleteTitle;
      const body = sessionType === 'focus' ? t.notifications.focusCompleteBody : t.notifications.breakCompleteBody;
      new Notification(title, { body: `${body}\n${getMotivationalMessage()}` });
    }
  }, [checkAchievements, getMotivationalMessage, sessionType, sessionsCompleted, setStats, settings, t.notifications.breakCompleteBody, t.notifications.breakCompleteTitle, t.notifications.focusCompleteBody, t.notifications.focusCompleteTitle]);

  useEffect(() => {
    if (!isRunning || !targetTimestampRef.current) return;

    const syncRemainingTime = () => {
      if (!targetTimestampRef.current) return;

      const remaining = Math.max(0, Math.ceil((targetTimestampRef.current - Date.now()) / 1000));

      setTimeLeft(prev => (prev !== remaining ? remaining : prev));

      if (remaining <= 0) {
        completeSession();
      }
    };

    syncRemainingTime();
    intervalRef.current = window.setInterval(syncRemainingTime, 250);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncRemainingTime();
      }
    };

    window.addEventListener('focus', syncRemainingTime);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('focus', syncRemainingTime);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [completeSession, isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft <= 0) {
      completeSession();
    }
  }, [completeSession, isRunning, timeLeft]);

  useEffect(() => {
    if (!isRunning || !settings.soundEnabled || timeLeft > 3 || timeLeft <= 0) {
      if (timeLeft > 3 || !isRunning) {
        lastCountdownBeepRef.current = null;
      }
      return;
    }

    if (lastCountdownBeepRef.current === timeLeft) return;

    lastCountdownBeepRef.current = timeLeft;
    playCountdownBeep();
  }, [isRunning, playCountdownBeep, settings.soundEnabled, timeLeft]);

  useEffect(() => {
    const settingsChanged =
      previousSettingsRef.current.focusMinutes !== settings.focusMinutes ||
      previousSettingsRef.current.shortBreakMinutes !== settings.shortBreakMinutes ||
      previousSettingsRef.current.longBreakMinutes !== settings.longBreakMinutes ||
      previousSettingsRef.current.longBreakInterval !== settings.longBreakInterval ||
      previousSettingsRef.current.soundEnabled !== settings.soundEnabled ||
      previousSettingsRef.current.autoplayEnabled !== settings.autoplayEnabled;
    const sessionTypeChanged = previousSessionTypeRef.current !== sessionType;

    previousSettingsRef.current = settings;
    previousSessionTypeRef.current = sessionType;

    if (isRunning || (!settingsChanged && !sessionTypeChanged)) return;

    setTimeLeft(getDurationForSession(sessionType, settings));
  }, [isRunning, sessionType, settings]);

  const start = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (settings.soundEnabled && beepAudioRef.current) {
      beepAudioRef.current.load();
    }

    targetTimestampRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  }, [settings.soundEnabled, timeLeft]);

  const pause = useCallback(() => {
    if (targetTimestampRef.current) {
      const remaining = Math.max(0, Math.ceil((targetTimestampRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
    }

    targetTimestampRef.current = null;
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    targetTimestampRef.current = null;
    lastCountdownBeepRef.current = null;
    setTimeLeft(getDurationForSession(sessionType, settings));
  }, [sessionType, settings]);

  const skip = useCallback(() => {
    setIsRunning(false);
    targetTimestampRef.current = null;
    lastCountdownBeepRef.current = null;
    completeSession();
  }, [completeSession]);

  const updateSettings = useCallback((newSettings: PomodoroSettings) => {
    setSettings(newSettings);
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const resetStats = useCallback(() => {
    setStats(prev => ({
      ...DEFAULT_STATS,
      achievements: prev.achievements,
    }));
    setSessionsCompleted(0);
    setIsRunning(false);
    targetTimestampRef.current = null;
    setSessionType('focus');
    lastCountdownBeepRef.current = null;
    setTimeLeft(settings.focusMinutes * 60);
  }, [setStats, settings.focusMinutes]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    totalTime,
    progress,
    isRunning,
    sessionType,
    sessionsCompleted,
    settings,
    stats,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset,
    skip,
    updateSettings,
    resetSettings,
    resetStats,
    setStats,
  };
}
