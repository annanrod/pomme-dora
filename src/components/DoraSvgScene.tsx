import { motion, AnimatePresence } from 'framer-motion';
import type { SessionType } from '@/hooks/usePomodoro';
import doraFocus from '@/assets/dora-focus.png';
import doraBreak from '@/assets/dora-break.png';

interface DoraSvgSceneProps {
  sessionType: SessionType;
  isRunning: boolean;
  treeLevel: number;
  progress: number;
}

const DoraSvgScene = ({ sessionType }: DoraSvgSceneProps) => {
  const isBreak = sessionType !== 'focus';

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <AnimatePresence mode="wait">
        <motion.img
          key={isBreak ? 'break' : 'focus'}
          src={isBreak ? doraBreak : doraFocus}
          alt={isBreak ? 'Dora descansando e comendo uma maçã' : 'Dora focada lendo um livro'}
          className="w-full h-auto"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          draggable={false}
        />
      </AnimatePresence>
    </div>
  );
};

export default DoraSvgScene;
