import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/i18n';
import { getDurationForSession, getNextSessionState, resolveRuntime } from '@/domain/pomodoro';
import { readStoredRuntime, writeStoredRuntime } from '@/lib/pomodoroRuntimeStorage';
import { usePomodoroHistory } from './usePomodoroHistory';
import { usePomodoroAudio } from './usePomodoroAudio';
import { usePomodoroNotifications } from './usePomodoroNotifications';
import { useLocalStorage } from './useLocalStorage';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  type PomodoroRuntime,
  type PomodoroSettings,
  type PomodoroStats,
  type SessionType,
} from '@/types/pomodoro';

interface SessionSnapshot {
  sessionType: SessionType;
  timeLeft: number;
  sessionsCompleted: number;
  stats: PomodoroStats;
}

export { DEFAULT_SETTINGS } from '@/types/pomodoro';
export type {
  PomodoroRuntime,
  PomodoroSettings,
  PomodoroStats,
  SessionType,
} from '@/types/pomodoro';

export function usePomodoro() {
  const { t } = useI18n();
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomme-settings', DEFAULT_SETTINGS);
  const [stats, setStats] = useLocalStorage<PomodoroStats>('pomme-stats', DEFAULT_STATS);

  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [hasHydratedRuntime, setHasHydratedRuntime] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const targetTimestampRef = useRef<number | null>(null);
  const previousSettingsRef = useRef(settings);
  const previousSessionTypeRef = useRef(sessionType);
  const hasRestoredRuntimeRef = useRef(false);

  const { playCountdownBeep, playCycleSound, primeCountdownAudio, resetCountdownState } = usePomodoroAudio();
  const { notifySessionComplete, requestPermission } = usePomodoroNotifications();
  const { push, pop, clear, canGoBack } = usePomodoroHistory<SessionSnapshot>();

  const totalTime = getDurationForSession(sessionType, settings);
  const progress = 1 - timeLeft / totalTime;

  const captureSessionSnapshot = useCallback(() => {
    push({
      sessionType,
      timeLeft,
      sessionsCompleted,
      stats,
    });
  }, [push, sessionType, sessionsCompleted, stats, timeLeft]);

  const getMotivationalMessage = useCallback(() => {
    return t.notifications.motivational[Math.floor(Math.random() * t.notifications.motivational.length)];
  }, [t.notifications.motivational]);

  useEffect(() => {
    if (hasRestoredRuntimeRef.current) return;

    const storedRuntime = readStoredRuntime();
    hasRestoredRuntimeRef.current = true;

    if (storedRuntime) {
      const resolved = resolveRuntime(storedRuntime, stats, settings);

      setSessionType(resolved.sessionType);
      setSessionsCompleted(resolved.sessionsCompleted);
      setTimeLeft(resolved.timeLeft);
      targetTimestampRef.current = resolved.targetTimestamp;
      setIsRunning(resolved.isRunning);
      setStats(resolved.stats);
    }

    setHasHydratedRuntime(true);
  }, [setStats, settings, stats]);

  useEffect(() => {
    if (!hasHydratedRuntime) return;

    const runtime: PomodoroRuntime = {
      sessionType,
      timeLeft,
      isRunning,
      sessionsCompleted,
      targetTimestamp: targetTimestampRef.current,
    };

    writeStoredRuntime(runtime);
  }, [hasHydratedRuntime, sessionType, timeLeft, isRunning, sessionsCompleted]);

  const applyTransition = useCallback((completedAt: Date) => {
    captureSessionSnapshot();
    targetTimestampRef.current = null;
    resetCountdownState();

    const transitioned = getNextSessionState(
      sessionType,
      sessionsCompleted,
      stats,
      settings,
      completedAt,
    );

    setStats(transitioned.stats);
    setSessionsCompleted(transitioned.sessionsCompleted);
    setSessionType(transitioned.sessionType);
    setTimeLeft(transitioned.timeLeft);

    if (settings.autoplayEnabled) {
      targetTimestampRef.current = Date.now() + transitioned.timeLeft * 1000;
    }

    setIsRunning(settings.autoplayEnabled);
    return transitioned;
  }, [captureSessionSnapshot, resetCountdownState, sessionType, sessionsCompleted, setStats, settings, stats]);

  const completeSession = useCallback(() => {
    const transitioned = applyTransition(new Date());

    if (settings.soundEnabled) {
      playCycleSound();
    }

    notifySessionComplete({
      enabled: settings.notificationsEnabled,
      sessionType,
      focusCompleteTitle: t.notifications.focusCompleteTitle,
      focusCompleteBody: t.notifications.focusCompleteBody,
      breakCompleteTitle: t.notifications.breakCompleteTitle,
      breakCompleteBody: t.notifications.breakCompleteBody,
      motivationalBody: getMotivationalMessage(),
    });

    return transitioned;
  }, [
    applyTransition,
    getMotivationalMessage,
    notifySessionComplete,
    playCycleSound,
    sessionType,
    settings.notificationsEnabled,
    settings.soundEnabled,
    t.notifications.breakCompleteBody,
    t.notifications.breakCompleteTitle,
    t.notifications.focusCompleteBody,
    t.notifications.focusCompleteTitle,
  ]);

  useEffect(() => {
    if (!isRunning || !targetTimestampRef.current) return;

    const syncRemainingTime = () => {
      if (!targetTimestampRef.current) return;

      const resolved = resolveRuntime(
        {
          sessionType,
          timeLeft,
          isRunning: true,
          sessionsCompleted,
          targetTimestamp: targetTimestampRef.current,
        },
        stats,
        settings,
      );

      if (
        resolved.sessionType !== sessionType ||
        resolved.sessionsCompleted !== sessionsCompleted
      ) {
        push({
          sessionType,
          timeLeft,
          sessionsCompleted,
          stats,
        });
      }

      targetTimestampRef.current = resolved.targetTimestamp;
      setSessionType((prev) => (prev !== resolved.sessionType ? resolved.sessionType : prev));
      setSessionsCompleted((prev) => (prev !== resolved.sessionsCompleted ? resolved.sessionsCompleted : prev));
      setStats((prev) => (prev !== resolved.stats ? resolved.stats : prev));
      setTimeLeft((prev) => (prev !== resolved.timeLeft ? resolved.timeLeft : prev));
      setIsRunning(resolved.isRunning);
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
  }, [isRunning, push, sessionType, sessionsCompleted, setStats, settings, stats, timeLeft]);

  useEffect(() => {
    if (!isRunning || !settings.soundEnabled || timeLeft > 3 || timeLeft <= 0) {
      if (timeLeft > 3 || !isRunning) {
        resetCountdownState();
      }
      return;
    }

    playCountdownBeep(timeLeft);
  }, [isRunning, playCountdownBeep, resetCountdownState, settings.soundEnabled, timeLeft]);

  useEffect(() => {
    const settingsChanged =
      previousSettingsRef.current.focusMinutes !== settings.focusMinutes ||
      previousSettingsRef.current.shortBreakMinutes !== settings.shortBreakMinutes ||
      previousSettingsRef.current.longBreakMinutes !== settings.longBreakMinutes ||
      previousSettingsRef.current.longBreakInterval !== settings.longBreakInterval ||
      previousSettingsRef.current.soundEnabled !== settings.soundEnabled ||
      previousSettingsRef.current.notificationsEnabled !== settings.notificationsEnabled ||
      previousSettingsRef.current.autoplayEnabled !== settings.autoplayEnabled;
    const sessionTypeChanged = previousSessionTypeRef.current !== sessionType;

    previousSettingsRef.current = settings;
    previousSessionTypeRef.current = sessionType;

    if (isRunning || (!settingsChanged && !sessionTypeChanged)) return;

    setTimeLeft(getDurationForSession(sessionType, settings));
  }, [isRunning, sessionType, settings]);

  const start = useCallback(() => {
    requestPermission(settings.notificationsEnabled);

    if (settings.soundEnabled) {
      primeCountdownAudio();
    }

    targetTimestampRef.current = Date.now() + timeLeft * 1000;
    setIsRunning(true);
  }, [primeCountdownAudio, requestPermission, settings.notificationsEnabled, settings.soundEnabled, timeLeft]);

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
    clear();
    resetCountdownState();
    setTimeLeft(getDurationForSession(sessionType, settings));
  }, [clear, resetCountdownState, sessionType, settings]);

  const skip = useCallback(() => {
    setIsRunning(false);
    targetTimestampRef.current = null;
    resetCountdownState();
    completeSession();
  }, [completeSession, resetCountdownState]);

  const goBack = useCallback(() => {
    const previousSession = pop();
    if (!previousSession) return;

    setIsRunning(false);
    targetTimestampRef.current = null;
    resetCountdownState();
    setSessionType(previousSession.sessionType);
    setTimeLeft(previousSession.timeLeft);
    setSessionsCompleted(previousSession.sessionsCompleted);
    setStats(previousSession.stats);
  }, [pop, resetCountdownState, setStats]);

  const updateSettings = useCallback((newSettings: PomodoroSettings) => {
    setSettings(newSettings);
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    setSessionsCompleted(0);
    setIsRunning(false);
    targetTimestampRef.current = null;
    setSessionType('focus');
    clear();
    resetCountdownState();
    setTimeLeft(settings.focusMinutes * 60);
  }, [clear, resetCountdownState, setStats, settings.focusMinutes]);

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
    goBack,
    skip,
    canGoBack,
    updateSettings,
    resetSettings,
    resetStats,
    setStats,
  };
}
