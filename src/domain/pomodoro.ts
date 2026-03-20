import type {
  PomodoroRuntime,
  PomodoroSettings,
  PomodoroStats,
  RuntimeResolution,
  SessionType,
} from '@/types/pomodoro';

const DAY_IN_MS = 86400000;

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

export function getDurationForSession(sessionType: SessionType, settings: PomodoroSettings) {
  if (sessionType === 'focus') return settings.focusMinutes * 60;
  if (sessionType === 'shortBreak') return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function advanceStatsForFocus(stats: PomodoroStats, settings: PomodoroSettings, completedAt: Date) {
  const todayKey = `${completedAt.getFullYear()}-${`${completedAt.getMonth() + 1}`.padStart(2, '0')}-${`${completedAt.getDate()}`.padStart(2, '0')}`;
  const newStreak = getStreakFromLastSession(stats.lastSessionDate, stats.currentStreak, todayKey);

  return {
    ...stats,
    totalSessions: stats.totalSessions + 1,
    totalFocusMinutes: stats.totalFocusMinutes + settings.focusMinutes,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    lastSessionDate: todayKey,
  };
}

function updateAchievements(stats: PomodoroStats) {
  const achievements = [...stats.achievements];
  if (stats.totalSessions >= 1 && !achievements.includes('first_session')) {
    achievements.push('first_session');
  }
  if (stats.totalSessions >= 10 && !achievements.includes('ten_sessions')) {
    achievements.push('ten_sessions');
  }
  if (stats.totalSessions >= 50 && !achievements.includes('fifty_sessions')) {
    achievements.push('fifty_sessions');
  }
  if (stats.currentStreak >= 3 && !achievements.includes('three_streak')) {
    achievements.push('three_streak');
  }
  if (stats.currentStreak >= 7 && !achievements.includes('week_streak')) {
    achievements.push('week_streak');
  }
  if (stats.totalFocusMinutes >= 60 && !achievements.includes('one_hour')) {
    achievements.push('one_hour');
  }
  if (stats.totalFocusMinutes >= 600 && !achievements.includes('ten_hours')) {
    achievements.push('ten_hours');
  }

  return { ...stats, achievements };
}

export function getNextSessionState(
  currentSessionType: SessionType,
  sessionsCompleted: number,
  stats: PomodoroStats,
  settings: PomodoroSettings,
  completedAt: Date,
) {
  if (currentSessionType === 'focus') {
    const nextStats = updateAchievements(advanceStatsForFocus(stats, settings, completedAt));
    const nextCompleted = sessionsCompleted + 1;
    const nextSessionType: SessionType = nextCompleted % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
    const nextTimeLeft = getDurationForSession(nextSessionType, settings);

    return {
      sessionType: nextSessionType,
      timeLeft: nextTimeLeft,
      sessionsCompleted: nextCompleted,
      stats: nextStats,
    };
  }

  return {
    sessionType: 'focus' as SessionType,
    timeLeft: settings.focusMinutes * 60,
    sessionsCompleted,
    stats,
  };
}

export function resolveRuntime(
  runtime: PomodoroRuntime,
  stats: PomodoroStats,
  settings: PomodoroSettings,
  now = Date.now(),
): RuntimeResolution {
  let nextSessionType = runtime.sessionType;
  let nextSessionsCompleted = runtime.sessionsCompleted;
  let nextStats = stats;
  let nextTargetTimestamp = runtime.targetTimestamp;
  const nextIsRunning = runtime.isRunning;
  let nextTimeLeft = Math.min(runtime.timeLeft, getDurationForSession(runtime.sessionType, settings));

  if (!runtime.isRunning || !runtime.targetTimestamp) {
    return {
      sessionType: nextSessionType,
      timeLeft: nextTimeLeft,
      isRunning: false,
      sessionsCompleted: nextSessionsCompleted,
      targetTimestamp: null,
      stats: nextStats,
    };
  }

  while (nextTargetTimestamp && nextTargetTimestamp <= now) {
    const completedAt = new Date(nextTargetTimestamp);
    const transitioned = getNextSessionState(
      nextSessionType,
      nextSessionsCompleted,
      nextStats,
      settings,
      completedAt,
    );

    nextSessionType = transitioned.sessionType;
    nextSessionsCompleted = transitioned.sessionsCompleted;
    nextStats = transitioned.stats;
    nextTimeLeft = transitioned.timeLeft;

    if (!settings.autoplayEnabled) {
      return {
        sessionType: nextSessionType,
        timeLeft: nextTimeLeft,
        isRunning: false,
        sessionsCompleted: nextSessionsCompleted,
        targetTimestamp: null,
        stats: nextStats,
      };
    }

    nextTargetTimestamp += nextTimeLeft * 1000;
  }

  nextTimeLeft = nextTargetTimestamp
    ? Math.max(0, Math.ceil((nextTargetTimestamp - now) / 1000))
    : nextTimeLeft;

  return {
    sessionType: nextSessionType,
    timeLeft: nextTimeLeft,
    isRunning: nextIsRunning && Boolean(nextTargetTimestamp),
    sessionsCompleted: nextSessionsCompleted,
    targetTimestamp: nextTargetTimestamp,
    stats: nextStats,
  };
}
