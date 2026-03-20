import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const TimerControls = ({ isRunning, onStart, onPause, onReset, onSkip }: TimerControlsProps) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-4">
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
        <Button
          aria-label={t.controls.reset}
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="rounded-full w-11 h-11 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <RotateCcw className="w-[18px] h-[18px]" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
        <Button
          aria-label={isRunning ? t.controls.pause : t.controls.start}
          onClick={isRunning ? onPause : onStart}
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
          size="icon"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
        <Button
          aria-label={t.controls.skip}
          variant="ghost"
          size="icon"
          onClick={onSkip}
          className="rounded-full w-11 h-11 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <SkipForward className="w-[18px] h-[18px]" />
        </Button>
      </motion.div>
    </div>
  );
};

export default TimerControls;
