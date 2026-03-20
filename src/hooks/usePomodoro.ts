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
  const previousSettingsRef = useRef(settings);
  const previousSessionTypeRef = useRef(sessionType);

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

  const completeSession = useCallback(() => {
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

      if (newCompleted % settings.longBreakInterval === 0) {
        setSessionType('longBreak');
        setTimeLeft(settings.longBreakMinutes * 60);
      } else {
        setSessionType('shortBreak');
        setTimeLeft(settings.shortBreakMinutes * 60);
      }
    } else {
      setSessionType('focus');
      setTimeLeft(settings.focusMinutes * 60);
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
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeSession();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, completeSession]);

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

    if (sessionType === 'focus') {
      setTimeLeft(settings.focusMinutes * 60);
    } else if (sessionType === 'shortBreak') {
      setTimeLeft(settings.shortBreakMinutes * 60);
    } else {
      setTimeLeft(settings.longBreakMinutes * 60);
    }
  }, [isRunning, sessionType, settings]);

  const start = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (settings.soundEnabled && beepAudioRef.current) {
      beepAudioRef.current.load();
    }

    setIsRunning(true);
  }, [settings.soundEnabled]);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    lastCountdownBeepRef.current = null;
    setTimeLeft(sessionType === 'focus'
      ? settings.focusMinutes * 60
      : sessionType === 'shortBreak'
      ? settings.shortBreakMinutes * 60
      : settings.longBreakMinutes * 60);
  }, [sessionType, settings]);

  const skip = useCallback(() => {
    setIsRunning(false);
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
