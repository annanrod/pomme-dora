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
    <div className="flex items-center justify-center gap-3">
      <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
        <Button
          aria-label={t.controls.reset}
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:h-11 sm:w-11"
        >
          <RotateCcw className="w-[18px] h-[18px]" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
        <Button
          aria-label={isRunning ? t.controls.pause : t.controls.start}
          onClick={isRunning ? onPause : onStart}
          className="h-[3.75rem] w-[3.75rem] rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 sm:h-[4.1rem] sm:w-[4.1rem]"
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
          className="h-10 w-10 rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:h-11 sm:w-11"
        >
          <SkipForward className="w-[18px] h-[18px]" />
        </Button>
      </motion.div>
    </div>
  );
};

export default TimerControls;
