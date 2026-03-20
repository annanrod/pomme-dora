import { motion } from 'framer-motion';
import { useI18n } from '@/i18n';
import type { SessionType } from '@/types/pomodoro';

interface TimerDisplayProps {
  formattedTime: string;
  progress: number;
  sessionType: SessionType;
  sessionsCompleted: number;
}

const TimerDisplay = ({ formattedTime, progress, sessionType, sessionsCompleted }: TimerDisplayProps) => {
  const { t } = useI18n();
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isBreak = sessionType !== 'focus';
  const sessionLabels: Record<SessionType, string> = {
    focus: t.timer.focus,
    shortBreak: t.timer.shortBreak,
    longBreak: t.timer.longBreak,
  };

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:gap-4">
      <motion.div
        className="px-2 text-center font-display text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs"
        key={sessionType}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0, color: isBreak ? 'hsl(145, 30%, 42%)' : 'hsl(5, 55%, 55%)' }}
        transition={{ duration: 0.4 }}
      >
        {sessionLabels[sessionType]}
      </motion.div>

      <div className="relative flex aspect-square w-[min(56vw,24vh,13rem)] items-center justify-center sm:w-[min(34vw,23vh,14rem)] md:w-[min(15rem,24vh)]">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="5"
            opacity="0.6"
          />
          {/* Progress arc */}
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            animate={{
              stroke: isBreak ? 'hsl(145, 35%, 50%)' : 'hsl(5, 55%, 58%)',
              strokeDashoffset,
            }}
            style={{ strokeDasharray: circumference }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <motion.div
          className="text-[clamp(1.8rem,7vw,2.7rem)] font-display font-bold tracking-tight text-foreground tabular-nums"
          key={formattedTime}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {formattedTime}
        </motion.div>
      </div>

      {/* Session dots */}
      <div className="flex flex-wrap items-center justify-center gap-2 px-3 text-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            animate={{
              backgroundColor: i < sessionsCompleted % 4
                ? 'hsl(var(--accent))'
                : 'hsl(var(--muted))',
              scale: i < sessionsCompleted % 4 ? 1.2 : 1,
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
        <span className="ml-1.5 text-[11px] font-body font-medium text-muted-foreground sm:text-xs">
          {sessionsCompleted} {t.timer.sessions}
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
