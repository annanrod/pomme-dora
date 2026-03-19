import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export interface PomodoroStats {
  totalSessions: number;
  totalFocusMinutes: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  achievements: string[];
  treeLevel: number;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

const DEFAULT_STATS: PomodoroStats = {
  totalSessions: 0,
  totalFocusMinutes: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastSessionDate: null,
  achievements: [],
  treeLevel: 1,
};

const MOTIVATIONAL_MESSAGES = [
  "You're doing great! 🌟",
  "Stay focused, Dora believes in you! 🍎",
  "One apple at a time! 🌳",
  "Your tree is growing! 🌱",
  "Focus is your superpower! ✨",
  "Almost there, keep going! 💪",
  "Great work! Time to rest 🌸",
  "You earned this break! ☕",
];

export function usePomodoro() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomme-settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<PomodoroStats>('pomme-stats', DEFAULT_STATS);
  
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const totalTime = sessionType === 'focus'
    ? settings.focusMinutes * 60
    : sessionType === 'shortBreak'
    ? settings.shortBreakMinutes * 60
    : settings.longBreakMinutes * 60;

  const progress = 1 - timeLeft / totalTime;

  const getMotivationalMessage = useCallback(() => {
    return MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
  }, []);

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
      const today = new Date().toDateString();
      setStats(prev => {
        const isConsecutiveDay = prev.lastSessionDate
          ? (new Date(today).getTime() - new Date(prev.lastSessionDate).getTime()) <= 86400000
          : true;
        const newStreak = isConsecutiveDay ? prev.currentStreak + 1 : 1;
        const newStats: PomodoroStats = {
          ...prev,
          totalSessions: prev.totalSessions + 1,
          totalFocusMinutes: prev.totalFocusMinutes + settings.focusMinutes,
          currentStreak: newStreak,
          bestStreak: Math.max(prev.bestStreak, newStreak),
          lastSessionDate: today,
          treeLevel: Math.min(10, Math.floor((prev.totalSessions + 1) / 3) + 1),
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
    setIsRunning(false);

    if ('Notification' in window && Notification.permission === 'granted') {
      const title = sessionType === 'focus' ? '🍎 Focus Complete!' : '🌳 Break Over!';
      const body = sessionType === 'focus' ? 'Time for a break!' : 'Ready to focus again?';
      new Notification(title, { body: `${body}\n${getMotivationalMessage()}` });
    }
  }, [sessionType, sessionsCompleted, settings, setStats, checkAchievements, getMotivationalMessage]);

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

  const start = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'focus'
      ? settings.focusMinutes * 60
      : sessionType === 'shortBreak'
      ? settings.shortBreakMinutes * 60
      : settings.longBreakMinutes * 60);
  }, [sessionType, settings]);

  const skip = useCallback(() => {
    setIsRunning(false);
    completeSession();
  }, [completeSession]);

  const updateSettings = useCallback((newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    if (!isRunning) {
      if (sessionType === 'focus') setTimeLeft(newSettings.focusMinutes * 60);
      else if (sessionType === 'shortBreak') setTimeLeft(newSettings.shortBreakMinutes * 60);
      else setTimeLeft(newSettings.longBreakMinutes * 60);
    }
  }, [isRunning, sessionType, setSettings]);

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
    motivationalMessage: getMotivationalMessage(),
    start,
    pause,
    reset,
    skip,
    updateSettings,
    setStats,
  };
}
