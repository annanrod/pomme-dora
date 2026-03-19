import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

const TimerControls = ({ isRunning, onStart, onPause, onReset, onSkip }: TimerControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="rounded-full w-10 h-10 bg-card hover:bg-muted"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>

      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          onClick={isRunning ? onPause : onStart}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          size="icon"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
      </motion.div>

      <Button
        variant="outline"
        size="icon"
        onClick={onSkip}
        className="rounded-full w-10 h-10 bg-card hover:bg-muted"
      >
        <SkipForward className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TimerControls;
