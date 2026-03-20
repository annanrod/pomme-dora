import { RUNTIME_STORAGE_KEY, type PomodoroRuntime } from '@/types/pomodoro';

export function readStoredRuntime() {
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

export function writeStoredRuntime(runtime: PomodoroRuntime) {
  try {
    localStorage.setItem(RUNTIME_STORAGE_KEY, JSON.stringify(runtime));
  } catch {
    // Ignore persistence failures.
  }
}
