import { act, renderHook } from '@testing-library/react';
import { I18nProvider } from '@/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePomodoro } from './usePomodoro';

function getStoredValue<T>(key: string): T {
  const value = window.localStorage.getItem(key);
  if (!value) {
    throw new Error(`Missing localStorage key: ${key}`);
  }

  return JSON.parse(value) as T;
}

type PomodoroHookResult = ReturnType<typeof usePomodoro>;

function completeFocusSession(result: { current: PomodoroHookResult }) {
  act(() => {
    result.current.skip();
  });

  if (result.current.sessionType !== 'focus') {
    act(() => {
      result.current.skip();
    });
  }
}

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-03-10T09:00:00'));
    window.localStorage.clear();

    Object.defineProperty(window, 'Notification', {
      configurable: true,
      writable: true,
      value: {
        permission: 'denied',
        requestPermission: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not increment streak twice on the same day', () => {
    const { result } = renderHook(() => usePomodoro(), { wrapper: I18nProvider });

    completeFocusSession(result);
    completeFocusSession(result);

    expect(result.current.stats.totalSessions).toBe(2);
    expect(result.current.stats.currentStreak).toBe(1);
    expect(result.current.stats.bestStreak).toBe(1);
    expect(result.current.stats.lastSessionDate).toBe('2025-03-10');
  });

  it('increments streak on the next day and resets after a gap', () => {
    const { result, rerender } = renderHook(() => usePomodoro(), { wrapper: I18nProvider });

    completeFocusSession(result);

    act(() => {
      vi.setSystemTime(new Date('2025-03-11T09:00:00'));
      rerender();
    });
    completeFocusSession(result);

    expect(result.current.stats.currentStreak).toBe(2);
    expect(result.current.stats.bestStreak).toBe(2);

    act(() => {
      vi.setSystemTime(new Date('2025-03-14T09:00:00'));
      rerender();
    });
    completeFocusSession(result);

    expect(result.current.stats.currentStreak).toBe(1);
    expect(result.current.stats.bestStreak).toBe(2);
  });

  it('transitions to a break and updates persisted stats after a completed focus session', () => {
    const { result } = renderHook(() => usePomodoro(), { wrapper: I18nProvider });

    act(() => {
      result.current.skip();
    });

    expect(result.current.sessionType).toBe('shortBreak');
    expect(result.current.sessionsCompleted).toBe(1);
    expect(result.current.timeLeft).toBe(result.current.settings.shortBreakMinutes * 60);

    const storedStats = getStoredValue<{
      totalSessions: number;
      totalFocusMinutes: number;
      currentStreak: number;
    }>('pomme-stats');

    expect(storedStats.totalSessions).toBe(1);
    expect(storedStats.totalFocusMinutes).toBe(result.current.settings.focusMinutes);
    expect(storedStats.currentStreak).toBe(1);
  });

  it('counts down while running and stops when paused', () => {
    const { result } = renderHook(() => usePomodoro(), { wrapper: I18nProvider });

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(result.current.settings.focusMinutes * 60 - 3);

    act(() => {
      result.current.pause();
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.timeLeft).toBe(result.current.settings.focusMinutes * 60 - 3);
  });
});
