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
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const isBreak = sessionType !== 'focus';

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="text-sm font-semibold font-display tracking-wider uppercase"
        animate={{ color: isBreak ? 'hsl(145, 30%, 42%)' : 'hsl(5, 55%, 55%)' }}
        key={sessionType}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {SESSION_LABELS[sessionType]}
      </motion.div>

      <div className="relative w-48 h-48 flex items-center justify-center">
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
          className="text-4xl font-display font-bold text-foreground tabular-nums tracking-tight"
          key={formattedTime}
          initial={{ scale: 1.03 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          {formattedTime}
        </motion.div>
      </div>

      {/* Session dots */}
      <div className="flex gap-2 items-center">
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
        <span className="text-xs text-muted-foreground ml-1.5 font-body font-medium">
          {sessionsCompleted} sessions
        </span>
      </div>
    </div>
  );
};

export default TimerDisplay;
