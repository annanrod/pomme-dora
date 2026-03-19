import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { SessionType } from '@/hooks/usePomodoro';
import doraFocus from '@/assets/dora-focus.png';
import doraBreak from '@/assets/dora-break.png';

interface DoraSvgSceneProps {
  sessionType: SessionType;
  isRunning: boolean;
  treeLevel: number;
  progress: number;
}

interface FallingApple {
  id: number;
  startX: number; // % from left
}

const DoraSvgScene = ({ sessionType, isRunning }: DoraSvgSceneProps) => {
  const isBreak = sessionType !== 'focus';
  const [fallingApples, setFallingApples] = useState<FallingApple[]>([]);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (!isRunning || isBreak) return;
    const interval = setInterval(() => {
      const newApple: FallingApple = {
        id: Date.now(),
        startX: 38 + Math.random() * 8, // around the left side of canopy (%)
      };
      setFallingApples(prev => [...prev.slice(-2), newApple]);
      // Bounce after apple reaches head
      setTimeout(() => setBounce(true), 1400);
      setTimeout(() => setBounce(false), 1800);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      {/* Main illustration */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isBreak ? 'break' : 'focus'}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.img
            src={isBreak ? doraBreak : doraFocus}
            alt={isBreak ? 'Dora descansando e comendo uma maçã' : 'Dora focada lendo um livro'}
            className="w-full h-auto"
            animate={{ y: bounce ? -6 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 10 }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* Falling apples overlay */}
      <AnimatePresence>
        {!isBreak && fallingApples.map(apple => (
          <motion.div
            key={apple.id}
            className="absolute pointer-events-none"
            style={{ left: `${apple.startX}%`, top: '18%' }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{ y: '220%', opacity: [1, 1, 0.8, 0], rotate: 25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeIn' }}
          >
            {/* Apple emoji/shape */}
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-red-400 shadow-sm" 
                style={{ background: 'radial-gradient(circle at 35% 30%, #F07060, #D04840)' }} 
              />
              {/* Stem */}
              <div className="absolute -top-1 left-1/2 w-[2px] h-[5px] bg-green-700 rounded-full" 
                style={{ transform: 'translateX(-50%) rotate(10deg)' }} 
              />
              {/* Shine */}
              <div className="absolute top-[2px] left-[3px] w-[5px] h-[3px] rounded-full bg-white/40" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Sparkle effect on head hit */}
      <AnimatePresence>
        {bounce && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: '58%', top: '52%' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-lg">✨</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoraSvgScene;
