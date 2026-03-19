import { motion } from 'framer-motion';
import type { SessionType } from '@/hooks/usePomodoro';

interface TimerDisplayProps {
  formattedTime: string;
  progress: number;
  sessionType: SessionType;
  sessionsCompleted: number;
}

const SESSION_LABELS: Record<SessionType, string> = {
  focus: '🍎 Focus Time',
  shortBreak: '🌿 Short Break',
  longBreak: '🌳 Long Break',
};

const TimerDisplay = ({ formattedTime, progress, sessionType, sessionsCompleted }: TimerDisplayProps) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isBreak = sessionType !== 'focus';

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        className="text-sm font-semibold font-display tracking-wide"
        animate={{ color: isBreak ? 'hsl(100, 40%, 40%)' : 'hsl(340, 40%, 50%)' }}
        key={sessionType}
        initial={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {SESSION_LABELS[sessionType]}
      </motion.div>

      <div className="relative w-52 h-52 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="100" cy="100" r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            animate={{
              stroke: isBreak ? 'hsl(100, 45%, 45%)' : 'hsl(var(--accent))',
              strokeDashoffset,
            }}
            style={{
              strokeDasharray: circumference,
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <motion.div
          className="text-5xl font-display font-bold text-foreground tabular-nums"
          key={formattedTime}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formattedTime}
        </motion.div>
      </div>

      <div className="flex gap-1.5 items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: i < sessionsCompleted % 4
                ? 'hsl(var(--accent))'
                : 'hsl(var(--muted))',
              scale: i < sessionsCompleted % 4 ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1 font-body">
          {sessionsCompleted} sessions
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
