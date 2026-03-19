import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { SessionType } from '@/hooks/usePomodoro';

interface DoraSvgSceneProps {
  sessionType: SessionType;
  isRunning: boolean;
  treeLevel: number;
  progress: number;
}

interface FallingApple {
  id: number;
  x: number;
  delay: number;
  hitsHead: boolean;
}

const DoraSvgScene = ({ sessionType, isRunning, treeLevel, progress }: DoraSvgSceneProps) => {
  const isBreak = sessionType !== 'focus';
  const [fallingApples, setFallingApples] = useState<FallingApple[]>([]);
  const [headBounce, setHeadBounce] = useState(false);

  // Falling apples during focus
  useEffect(() => {
    if (!isRunning || isBreak) return;
    const interval = setInterval(() => {
      const hitsHead = Math.random() < 0.3;
      const newApple: FallingApple = {
        id: Date.now(),
        x: hitsHead ? 200 : 140 + Math.random() * 120,
        delay: 0,
        hitsHead,
      };
      setFallingApples(prev => [...prev.slice(-4), newApple]);
      if (hitsHead) {
        setTimeout(() => setHeadBounce(true), 1800);
        setTimeout(() => setHeadBounce(false), 2200);
      }
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const treeScale = 0.7 + (treeLevel / 10) * 0.3;
  const leafCount = Math.min(treeLevel * 2 + 3, 20);

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        animate={{ filter: isBreak ? 'brightness(1.1) saturate(1.2)' : 'brightness(0.95) saturate(1)' }}
        transition={{ duration: 1.5 }}
      >
        {/* Sky */}
        <motion.rect
          x="0" y="0" width="400" height="280"
          animate={{ fill: isBreak ? 'hsl(45, 70%, 80%)' : 'hsl(210, 30%, 75%)' }}
          transition={{ duration: 1.5 }}
        />

        {/* Sun/Moon */}
        <motion.circle
          cx="320" cy="60" r="30"
          animate={{
            fill: isBreak ? 'hsl(45, 90%, 65%)' : 'hsl(45, 30%, 70%)',
            r: isBreak ? 35 : 25,
            opacity: isBreak ? 1 : 0.6,
          }}
          transition={{ duration: 1.5 }}
        />
        {isBreak && (
          <motion.circle
            cx="320" cy="60" r="45"
            fill="hsl(45, 90%, 65%)"
            className="animate-glow"
            opacity={0.2}
          />
        )}

        {/* Clouds */}
        <motion.g animate={{ x: [0, 10, 0] }} transition={{ duration: 20, repeat: Infinity }}>
          <ellipse cx="80" cy="50" rx="40" ry="15" fill="hsl(0, 0%, 100%)" opacity="0.6" />
          <ellipse cx="100" cy="45" rx="30" ry="12" fill="hsl(0, 0%, 100%)" opacity="0.5" />
        </motion.g>
        <motion.g animate={{ x: [0, -8, 0] }} transition={{ duration: 25, repeat: Infinity }}>
          <ellipse cx="250" cy="80" rx="35" ry="12" fill="hsl(0, 0%, 100%)" opacity="0.4" />
        </motion.g>

        {/* Ground */}
        <motion.rect
          x="0" y="280" width="400" height="120"
          animate={{ fill: isBreak ? 'hsl(100, 35%, 55%)' : 'hsl(100, 25%, 45%)' }}
          transition={{ duration: 1.5 }}
        />
        {/* Ground detail */}
        <ellipse cx="200" cy="290" rx="200" ry="20" fill="hsl(100, 30%, 40%)" opacity="0.3" />

        {/* Tree */}
        <motion.g
          animate={{ scale: treeScale }}
          style={{ transformOrigin: '200px 280px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Trunk */}
          <rect x="188" y="180" width="24" height="100" rx="4" fill="hsl(25, 40%, 30%)" />
          <rect x="185" y="270" width="30" height="15" rx="6" fill="hsl(25, 35%, 28%)" />
          {/* Branch */}
          <line x1="200" y1="220" x2="160" y2="200" stroke="hsl(25, 40%, 30%)" strokeWidth="6" strokeLinecap="round" />
          <line x1="200" y1="210" x2="240" y2="190" stroke="hsl(25, 40%, 30%)" strokeWidth="5" strokeLinecap="round" />

          {/* Leaves canopy */}
          <motion.g className="animate-sway" style={{ transformOrigin: '200px 160px' }}>
            {Array.from({ length: leafCount }).map((_, i) => {
              const angle = (i / leafCount) * Math.PI * 2;
              const rx = 55 + Math.sin(i * 1.5) * 15;
              const ry = 40 + Math.cos(i * 1.2) * 10;
              const cx = 200 + Math.cos(angle) * 30;
              const cy = 160 + Math.sin(angle) * 20;
              return (
                <motion.ellipse
                  key={i}
                  cx={cx} cy={cy} rx={rx / 2} ry={ry / 2}
                  animate={{
                    fill: isBreak ? 'hsl(100, 50%, 50%)' : 'hsl(130, 40%, 40%)',
                  }}
                  transition={{ duration: 1.5 }}
                  opacity={0.8}
                  className="animate-leaf"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              );
            })}
            {/* Main canopy */}
            <motion.ellipse
              cx="200" cy="160" rx="65" ry="50"
              animate={{ fill: isBreak ? 'hsl(110, 45%, 48%)' : 'hsl(135, 38%, 38%)' }}
              transition={{ duration: 1.5 }}
            />
            <motion.ellipse
              cx="180" cy="150" rx="45" ry="35"
              animate={{ fill: isBreak ? 'hsl(105, 50%, 52%)' : 'hsl(130, 40%, 42%)' }}
              transition={{ duration: 1.5 }}
            />
            <motion.ellipse
              cx="220" cy="145" rx="40" ry="32"
              animate={{ fill: isBreak ? 'hsl(115, 48%, 50%)' : 'hsl(128, 42%, 40%)' }}
              transition={{ duration: 1.5 }}
            />

            {/* Apples on tree */}
            {[
              { cx: 165, cy: 155 },
              { cx: 230, cy: 150 },
              { cx: 195, cy: 135 },
              { cx: 215, cy: 170 },
            ].slice(0, Math.max(1, Math.floor(treeLevel / 2))).map((pos, i) => (
              <circle key={`apple-${i}`} cx={pos.cx} cy={pos.cy} r="5" fill="hsl(0, 70%, 50%)" />
            ))}
          </motion.g>
        </motion.g>

        {/* Falling Apples */}
        <AnimatePresence>
          {fallingApples.map(apple => (
            <motion.circle
              key={apple.id}
              cx={apple.x}
              cy={170}
              r="5"
              fill="hsl(0, 70%, 50%)"
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{ y: 110, opacity: 0, rotate: 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeIn" }}
            />
          ))}
        </AnimatePresence>

        {/* Dora */}
        <motion.g
          animate={{ y: headBounce ? -3 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
          {/* Body / Dress */}
          <motion.path
            d="M185 310 Q185 290 200 288 Q215 290 215 310 L220 340 Q200 345 180 340 Z"
            animate={{ fill: isBreak ? 'hsl(340, 50%, 60%)' : 'hsl(340, 45%, 55%)' }}
            transition={{ duration: 1 }}
          />

          {/* Arms */}
          {isBreak ? (
            <>
              {/* Arm reaching for apple */}
              <motion.line
                x1="185" y1="300" x2="170" y2="285"
                stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round"
                animate={{ x2: [170, 168, 170], y2: [285, 283, 285] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Apple in hand */}
              <motion.circle
                cx="168" cy="283" r="5" fill="hsl(0, 70%, 50%)"
                animate={{ cx: [168, 175, 168], cy: [283, 280, 283] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <line x1="215" y1="300" x2="225" y2="315" stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Resting arms */}
              <line x1="185" y1="300" x2="175" y2="320" stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round" />
              <line x1="215" y1="300" x2="225" y2="320" stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round" />
            </>
          )}

          {/* Legs */}
          <line x1="190" y1="340" x2="185" y2="360" stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round" />
          <line x1="210" y1="340" x2="215" y2="360" stroke="hsl(30, 50%, 75%)" strokeWidth="4" strokeLinecap="round" />
          {/* Shoes */}
          <ellipse cx="183" cy="362" rx="6" ry="3" fill="hsl(25, 50%, 25%)" />
          <ellipse cx="217" cy="362" rx="6" ry="3" fill="hsl(25, 50%, 25%)" />

          {/* Head */}
          <circle cx="200" cy="275" r="18" fill="hsl(30, 50%, 75%)" />

          {/* Hair */}
          <path d="M182 270 Q182 255 200 252 Q218 255 218 270" fill="hsl(25, 50%, 25%)" />
          <ellipse cx="182" cy="272" rx="3" ry="8" fill="hsl(25, 50%, 25%)" />
          <ellipse cx="218" cy="272" rx="3" ry="8" fill="hsl(25, 50%, 25%)" />

          {/* Face */}
          {isBreak ? (
            <>
              {/* Happy eyes */}
              <path d="M193 274 Q195 271 197 274" stroke="hsl(25, 40%, 20%)" strokeWidth="1.5" fill="none" />
              <path d="M203 274 Q205 271 207 274" stroke="hsl(25, 40%, 20%)" strokeWidth="1.5" fill="none" />
              {/* Happy mouth */}
              <motion.path
                d="M194 282 Q200 288 206 282"
                stroke="hsl(0, 60%, 50%)" strokeWidth="1.5" fill="none"
                className="animate-munch"
              />
              {/* Blush */}
              <circle cx="190" cy="280" r="3" fill="hsl(0, 50%, 75%)" opacity="0.5" />
              <circle cx="210" cy="280" r="3" fill="hsl(0, 50%, 75%)" opacity="0.5" />
            </>
          ) : (
            <>
              {/* Focused eyes */}
              <motion.g className="animate-blink" style={{ transformOrigin: '200px 274px' }}>
                <circle cx="194" cy="274" r="2" fill="hsl(25, 40%, 20%)" />
                <circle cx="206" cy="274" r="2" fill="hsl(25, 40%, 20%)" />
              </motion.g>
              {/* Neutral mouth */}
              <line x1="196" y1="282" x2="204" y2="282" stroke="hsl(0, 40%, 45%)" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </motion.g>

        {/* Grass tufts */}
        {[50, 120, 280, 340, 30, 370].map((x, i) => (
          <motion.path
            key={i}
            d={`M${x} 290 Q${x + 3} 280 ${x + 6} 290`}
            stroke="hsl(120, 30%, 35%)"
            strokeWidth="2"
            fill="none"
            className="animate-leaf"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}

        {/* Small flowers */}
        {[70, 310, 350].map((x, i) => (
          <g key={`flower-${i}`}>
            <circle cx={x} cy={295} r="3" fill={`hsl(${[45, 320, 280][i]}, 60%, 70%)`} />
            <circle cx={x} cy={295} r="1.5" fill="hsl(45, 80%, 60%)" />
          </g>
        ))}
      </motion.svg>
    </div>
  );
};

export default DoraSvgScene;
