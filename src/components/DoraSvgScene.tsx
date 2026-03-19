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

const S = 'hsl(var(--foreground))'; // stroke color
const SW = 1.2; // base stroke width

const DoraSvgScene = ({ sessionType, isRunning, treeLevel, progress }: DoraSvgSceneProps) => {
  const isBreak = sessionType !== 'focus';
  const [fallingApples, setFallingApples] = useState<FallingApple[]>([]);
  const [headBounce, setHeadBounce] = useState(false);

  useEffect(() => {
    if (!isRunning || isBreak) return;
    const interval = setInterval(() => {
      const hitsHead = Math.random() < 0.3;
      const newApple: FallingApple = {
        id: Date.now(),
        x: hitsHead ? 228 : 160 + Math.random() * 100,
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
  const appleCount = Math.max(1, Math.floor(treeLevel / 2));

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square">
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        fill="none"
      >
        {/* Ground line */}
        <motion.line
          x1="0" y1="320" x2="400" y2="320"
          stroke={S} strokeWidth={SW * 0.8}
          animate={{ opacity: isBreak ? 0.3 : 0.2 }}
        />

        {/* Small ground details */}
        {[30, 90, 300, 360].map((x, i) => (
          <motion.path
            key={`grass-${i}`}
            d={`M${x} 320 Q${x + 4} 312 ${x + 8} 320`}
            stroke={S}
            strokeWidth={SW * 0.6}
            opacity={0.3}
            className="animate-leaf"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}

        {/* Sun / Moon - fine circle */}
        <motion.circle
          cx="330" cy="60" r="18"
          stroke={S}
          strokeWidth={SW * 0.7}
          animate={{ opacity: isBreak ? 0.5 : 0.2 }}
          transition={{ duration: 1.5 }}
        />
        {isBreak && (
          <>
            {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
              const rad = (angle * Math.PI) / 180;
              return (
                <motion.line
                  key={angle}
                  x1={330 + Math.cos(rad) * 22} y1={60 + Math.sin(rad) * 22}
                  x2={330 + Math.cos(rad) * 28} y2={60 + Math.sin(rad) * 28}
                  stroke={S} strokeWidth={SW * 0.5} strokeLinecap="round"
                  opacity={0.3}
                />
              );
            })}
          </>
        )}

        {/* Cloud - simple arcs */}
        <motion.g animate={{ x: [0, 8, 0] }} transition={{ duration: 25, repeat: Infinity }}>
          <path d="M60 55 Q70 40 85 48 Q95 38 110 48 Q120 42 125 55" stroke={S} strokeWidth={SW * 0.5} opacity={0.2} strokeLinecap="round" />
        </motion.g>

        {/* Tree */}
        <motion.g
          animate={{ scale: treeScale }}
          style={{ transformOrigin: '190px 320px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Trunk */}
          <line x1="190" y1="200" x2="190" y2="320" stroke={S} strokeWidth={SW * 1.5} strokeLinecap="round" />

          {/* Branches */}
          <line x1="190" y1="240" x2="155" y2="215" stroke={S} strokeWidth={SW} strokeLinecap="round" />
          <line x1="190" y1="225" x2="220" y2="200" stroke={S} strokeWidth={SW} strokeLinecap="round" />
          <line x1="190" y1="260" x2="160" y2="245" stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round" />
          <line x1="190" y1="255" x2="215" y2="238" stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round" />

          {/* Canopy - delicate leaf outlines */}
          <motion.g className="animate-sway" style={{ transformOrigin: '190px 180px' }}>
            <ellipse cx="190" cy="175" rx="55" ry="42" stroke={S} strokeWidth={SW} opacity={0.35} />
            <ellipse cx="170" cy="168" rx="35" ry="28" stroke={S} strokeWidth={SW * 0.7} opacity={0.25} />
            <ellipse cx="210" cy="165" rx="30" ry="25" stroke={S} strokeWidth={SW * 0.7} opacity={0.25} />
            <ellipse cx="190" cy="155" rx="25" ry="20" stroke={S} strokeWidth={SW * 0.6} opacity={0.2} />

            {/* Individual leaves on branches */}
            {[
              'M155 215 Q148 208 152 200',
              'M150 218 Q142 215 145 208',
              'M220 200 Q228 195 225 188',
              'M218 203 Q225 200 222 193',
              'M160 245 Q153 240 156 234',
              'M215 238 Q222 234 219 228',
            ].map((d, i) => (
              <path key={`leaf-${i}`} d={d} stroke={S} strokeWidth={SW * 0.6} strokeLinecap="round" opacity={0.3} />
            ))}

            {/* Apples on tree - small circles */}
            {[
              { cx: 170, cy: 165 },
              { cx: 210, cy: 162 },
              { cx: 188, cy: 148 },
              { cx: 200, cy: 178 },
              { cx: 175, cy: 185 },
            ].slice(0, appleCount).map((pos, i) => (
              <circle key={`apple-${i}`} cx={pos.cx} cy={pos.cy} r="4" stroke={S} strokeWidth={SW * 0.8} opacity={0.5} />
            ))}
          </motion.g>
        </motion.g>

        {/* Falling Apples */}
        <AnimatePresence>
          {fallingApples.map(apple => (
            <motion.circle
              key={apple.id}
              cx={apple.x}
              cy={180}
              r="4"
              stroke={S}
              strokeWidth={SW * 0.8}
              initial={{ y: 0, opacity: 0.6 }}
              animate={{ y: 130, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeIn" }}
            />
          ))}
        </AnimatePresence>

        {/* Dora - sitting sideways at the foot of the tree */}
        <motion.g
          animate={{ y: headBounce ? -3 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
          {/* Body / torso */}
          <path
            d="M215 298 Q218 288 225 285 Q232 288 235 298 L237 318 Q225 322 213 318 Z"
            stroke={S} strokeWidth={SW} strokeLinejoin="round"
          />

          {/* Arms */}
          {isBreak ? (
            <>
              {/* Arm reaching for apple */}
              <motion.line
                x1="218" y1="294" x2="205" y2="284"
                stroke={S} strokeWidth={SW} strokeLinecap="round"
                animate={{ x2: [205, 202, 205], y2: [284, 282, 284] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              {/* Apple in hand */}
              <motion.circle
                cx="203" cy="282" r="4"
                stroke={S} strokeWidth={SW * 0.8}
                animate={{ cx: [203, 200, 203], cy: [282, 280, 282] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <line x1="233" y1="296" x2="240" y2="308" stroke={S} strokeWidth={SW} strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="218" y1="294" x2="208" y2="310" stroke={S} strokeWidth={SW} strokeLinecap="round" />
              <line x1="233" y1="296" x2="242" y2="310" stroke={S} strokeWidth={SW} strokeLinecap="round" />
            </>
          )}

          {/* Legs - seated */}
          <line x1="218" y1="318" x2="205" y2="332" stroke={S} strokeWidth={SW} strokeLinecap="round" />
          <line x1="228" y1="318" x2="215" y2="335" stroke={S} strokeWidth={SW} strokeLinecap="round" />
          {/* Shoes - small marks */}
          <line x1="202" y1="332" x2="198" y2="332" stroke={S} strokeWidth={SW * 1.2} strokeLinecap="round" />
          <line x1="212" y1="335" x2="208" y2="335" stroke={S} strokeWidth={SW * 1.2} strokeLinecap="round" />

          {/* Head */}
          <circle cx="225" cy="272" r="14" stroke={S} strokeWidth={SW} />

          {/* Hair - simple strokes */}
          <path d="M211 268 Q215 255 225 253 Q235 255 239 268" stroke={S} strokeWidth={SW} strokeLinecap="round" />
          <line x1="211" y1="268" x2="211" y2="278" stroke={S} strokeWidth={SW * 0.7} strokeLinecap="round" />
          <line x1="239" y1="268" x2="239" y2="278" stroke={S} strokeWidth={SW * 0.7} strokeLinecap="round" />
          {/* Hair detail */}
          <path d="M215 256 Q218 250 222 254" stroke={S} strokeWidth={SW * 0.5} strokeLinecap="round" opacity={0.4} />

          {/* Face */}
          {isBreak ? (
            <>
              {/* Happy eyes - arcs */}
              <path d="M219 271 Q221 268 223 271" stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round" />
              <path d="M227 271 Q229 268 231 271" stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round" />
              {/* Smile */}
              <motion.path
                d="M221 278 Q225 283 229 278"
                stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round"
                className="animate-munch"
              />
              {/* Blush - tiny dots */}
              <circle cx="218" cy="276" r="1.5" stroke={S} strokeWidth={SW * 0.3} opacity={0.2} />
              <circle cx="232" cy="276" r="1.5" stroke={S} strokeWidth={SW * 0.3} opacity={0.2} />
            </>
          ) : (
            <>
              {/* Focused eyes - dots */}
              <motion.g className="animate-blink" style={{ transformOrigin: '225px 271px' }}>
                <circle cx="220" cy="271" r="1.2" fill={S} />
                <circle cx="230" cy="271" r="1.2" fill={S} />
              </motion.g>
              {/* Neutral mouth */}
              <line x1="223" y1="278" x2="228" y2="278" stroke={S} strokeWidth={SW * 0.8} strokeLinecap="round" />
            </>
          )}
        </motion.g>

        {/* Small flowers - minimal */}
        {[80, 310, 350].map((x, i) => (
          <g key={`flower-${i}`} opacity={0.25}>
            <line x1={x} y1={320} x2={x} y2={312} stroke={S} strokeWidth={SW * 0.5} />
            <circle cx={x} cy={310} r="2.5" stroke={S} strokeWidth={SW * 0.5} />
          </g>
        ))}
      </motion.svg>
    </div>
  );
};

export default DoraSvgScene;
