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
  hitsHead: boolean;
}

const DoraSvgScene = ({ sessionType, isRunning, treeLevel, progress }: DoraSvgSceneProps) => {
  const isBreak = sessionType !== 'focus';
  const [fallingApples, setFallingApples] = useState<FallingApple[]>([]);
  const [headBounce, setHeadBounce] = useState(false);

  useEffect(() => {
    if (!isRunning || isBreak) return;
    const interval = setInterval(() => {
      const hitsHead = Math.random() < 0.35;
      const newApple: FallingApple = {
        id: Date.now(),
        x: hitsHead ? 230 : 155 + Math.random() * 90,
        hitsHead,
      };
      setFallingApples(prev => [...prev.slice(-3), newApple]);
      if (hitsHead) {
        setTimeout(() => setHeadBounce(true), 1600);
        setTimeout(() => setHeadBounce(false), 2000);
      }
    }, 4500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const treeScale = 0.75 + (treeLevel / 10) * 0.25;
  const appleCount = Math.max(1, Math.floor(treeLevel / 2));

  return (
    <div className="relative w-full max-w-[380px] mx-auto" style={{ aspectRatio: '1/0.85' }}>
      <motion.svg
        viewBox="0 0 400 340"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Soft gradients */}
          <linearGradient id="skyGradFocus" x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#FFF5E6' : '#E8EDF5' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#FFECD2' : '#DDE4EF' }} transition={{ duration: 1.5 }} />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#C8E6A0' : '#B0CFA0' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#A8D080' : '#96B888' }} transition={{ duration: 1.5 }} />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE4A0" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FFE4A0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8B7355" />
            <stop offset="50%" stopColor="#A0896A" />
            <stop offset="100%" stopColor="#7A6548" />
          </linearGradient>
          <radialGradient id="canopyGrad" cx="45%" cy="40%" r="55%">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#8BC370' : '#6DAA6E' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="60%" animate={{ stopColor: isBreak ? '#6AAF55' : '#5A9560' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#4E9B3E' : '#4A8050' }} transition={{ duration: 1.5 }} />
          </radialGradient>
          <radialGradient id="canopyHighlight" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="appleGrad" cx="35%" cy="30%" r="55%">
            <stop offset="0%" stopColor="#F06050" />
            <stop offset="100%" stopColor="#D44030" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="1" dy="2" />
            <feComponentTransfer><feFuncA type="linear" slope="0.12" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="400" height="260" fill="url(#skyGradFocus)" />

        {/* Sun */}
        <motion.g animate={{ opacity: isBreak ? 1 : 0.5 }} transition={{ duration: 1.5 }}>
          <circle cx="330" cy="55" r="45" fill="url(#sunGlow)" />
          <motion.circle cx="330" cy="55" animate={{ r: isBreak ? 18 : 14 }} fill="#FFD580" transition={{ duration: 1.5 }} />
          {isBreak && (
            <motion.circle cx="330" cy="55" r="22" fill="none" stroke="#FFD580" strokeWidth="1" opacity={0.3}
              animate={{ r: [22, 26, 22], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}
        </motion.g>

        {/* Clouds */}
        <motion.g animate={{ x: [0, 12, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}>
          <g opacity="0.5">
            <ellipse cx="75" cy="50" rx="28" ry="10" fill="white" />
            <ellipse cx="95" cy="46" rx="22" ry="9" fill="white" />
            <ellipse cx="60" cy="48" rx="18" ry="8" fill="white" />
          </g>
        </motion.g>
        <motion.g animate={{ x: [0, -10, 0] }} transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}>
          <g opacity="0.35">
            <ellipse cx="260" cy="72" rx="24" ry="8" fill="white" />
            <ellipse cx="278" cy="69" rx="18" ry="7" fill="white" />
          </g>
        </motion.g>

        {/* Ground */}
        <ellipse cx="200" cy="268" rx="220" ry="30" fill="url(#groundGrad)" />
        <rect x="0" y="268" width="400" height="80" fill="url(#groundGrad)" />

        {/* Ground grass details */}
        {[30, 70, 115, 280, 320, 365].map((x, i) => (
          <motion.g key={`grass-${i}`} className="animate-leaf" style={{ animationDelay: `${i * 0.7}s` }}>
            <path d={`M${x} 268 Q${x - 2} 258 ${x + 3} 255`} stroke="#6A9A58" strokeWidth="1.5" fill="none" opacity="0.4" strokeLinecap="round" />
            <path d={`M${x + 5} 268 Q${x + 8} 260 ${x + 4} 256`} stroke="#6A9A58" strokeWidth="1.2" fill="none" opacity="0.3" strokeLinecap="round" />
          </motion.g>
        ))}

        {/* Small flowers */}
        {[{ x: 55, c: '#F2A0B0' }, { x: 310, c: '#E8C870' }, { x: 355, c: '#B8A0D8' }].map((f, i) => (
          <g key={`flower-${i}`}>
            <line x1={f.x} y1={268} x2={f.x} y2={258} stroke="#6A9A58" strokeWidth="1.2" />
            <circle cx={f.x} cy={256} r="3" fill={f.c} opacity="0.6" />
            <circle cx={f.x} cy={256} r="1.5" fill="#FFE8A0" opacity="0.8" />
          </g>
        ))}

        {/* Tree */}
        <motion.g
          animate={{ scale: treeScale }}
          style={{ transformOrigin: '190px 268px' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          filter="url(#softShadow)"
        >
          {/* Trunk */}
          <path d="M183 200 L180 268 L200 270 L197 200" fill="url(#trunkGrad)" />
          <path d="M178 265 Q190 275 202 265" fill="#7A6548" opacity="0.4" />

          {/* Branches */}
          <path d="M190 230 Q172 218 155 212" stroke="#8B7355" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M190 218 Q210 206 225 198" stroke="#8B7355" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M190 245 Q175 238 162 235" stroke="#8B7355" strokeWidth="3" fill="none" strokeLinecap="round" />

          {/* Canopy */}
          <motion.g className="animate-sway" style={{ transformOrigin: '190px 170px' }}>
            {/* Main foliage mass */}
            <ellipse cx="190" cy="168" rx="62" ry="50" fill="url(#canopyGrad)" />
            <ellipse cx="165" cy="160" rx="38" ry="32" fill="url(#canopyGrad)" opacity="0.8" />
            <ellipse cx="215" cy="155" rx="35" ry="30" fill="url(#canopyGrad)" opacity="0.8" />
            <ellipse cx="190" cy="148" rx="30" ry="25" fill="url(#canopyGrad)" opacity="0.7" />
            
            {/* Highlight */}
            <ellipse cx="175" cy="155" rx="30" ry="22" fill="url(#canopyHighlight)" />

            {/* Leaf texture - subtle darker patches */}
            <ellipse cx="205" cy="175" rx="18" ry="14" fill="#4A8050" opacity="0.25" />
            <ellipse cx="170" cy="175" rx="15" ry="12" fill="#4A8050" opacity="0.2" />

            {/* Apples on tree */}
            {[
              { cx: 168, cy: 162 },
              { cx: 212, cy: 158 },
              { cx: 188, cy: 143 },
              { cx: 202, cy: 176 },
              { cx: 175, cy: 180 },
            ].slice(0, appleCount).map((pos, i) => (
              <g key={`apple-${i}`}>
                <circle cx={pos.cx} cy={pos.cy} r="5.5" fill="url(#appleGrad)" />
                <path d={`M${pos.cx} ${pos.cy - 5} Q${pos.cx + 2} ${pos.cy - 8} ${pos.cx + 4} ${pos.cy - 7}`} stroke="#5A8040" strokeWidth="1" fill="none" />
                <ellipse cx={pos.cx - 1.5} cy={pos.cy - 1.5} rx="1.5" ry="1" fill="white" opacity="0.3" />
              </g>
            ))}
          </motion.g>
        </motion.g>

        {/* Falling Apples */}
        <AnimatePresence>
          {fallingApples.map(apple => (
            <motion.g
              key={apple.id}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{ y: apple.hitsHead ? 95 : 110, opacity: [1, 1, 0], rotate: 30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeIn" }}
            >
              <circle cx={apple.x} cy={175} r="5" fill="url(#appleGrad)" />
              <ellipse cx={apple.x - 1.5} cy={173.5} rx="1.5" ry="1" fill="white" opacity="0.3" />
            </motion.g>
          ))}
        </AnimatePresence>

        {/* Dora - sitting sideways at the foot of the tree */}
        <motion.g
          animate={{ y: headBounce ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          filter="url(#softShadow)"
        >
          {/* Shadow on ground */}
          <ellipse cx="228" cy="272" rx="20" ry="4" fill="#5A8050" opacity="0.15" />

          {/* Body / Dress */}
          <motion.path
            d="M218 290 Q220 278 228 274 Q236 278 238 290 L240 308 Q228 314 216 308 Z"
            animate={{ fill: isBreak ? '#E8889A' : '#D8788A' }}
            transition={{ duration: 1 }}
          />
          {/* Dress detail - collar */}
          <path d="M224 276 Q228 278 232 276" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />

          {/* Arms */}
          {isBreak ? (
            <>
              <motion.path
                d="M220 286 Q212 278 206 275"
                stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round"
                animate={{ d: ['M220 286 Q212 278 206 275', 'M220 286 Q212 276 204 273', 'M220 286 Q212 278 206 275'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Apple in hand */}
              <motion.g
                animate={{ x: [0, -2, 0], y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <circle cx="204" cy="273" r="5" fill="url(#appleGrad)" />
                <ellipse cx="202.5" cy="271.5" rx="1.5" ry="1" fill="white" opacity="0.3" />
              </motion.g>
              <path d="M236 288 Q242 296 244 304" stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M220 286 Q214 296 210 304" stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M236 288 Q242 298 244 306" stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Legs */}
          <path d="M220 308 Q214 318 208 326" stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M230 308 Q224 320 218 328" stroke="#F0C8A8" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Shoes */}
          <ellipse cx="206" cy="328" rx="6" ry="3.5" fill="#8B7355" rx="6" />
          <ellipse cx="216" cy="330" rx="6" ry="3.5" fill="#8B7355" />

          {/* Head */}
          <circle cx="228" cy="260" r="16" fill="#F0C8A8" />

          {/* Hair */}
          <path d="M212 256 Q215 242 228 240 Q241 242 244 256" fill="#6B4930" />
          <ellipse cx="212" cy="258" rx="3.5" ry="9" fill="#6B4930" />
          <ellipse cx="244" cy="258" rx="3.5" ry="9" fill="#6B4930" />
          {/* Hair highlight */}
          <path d="M218 244 Q222 240 226 243" stroke="#8B6540" strokeWidth="1" fill="none" opacity="0.5" />
          {/* Hair band */}
          <path d="M214 252 Q228 248 242 252" stroke="#E8889A" strokeWidth="1.8" fill="none" />

          {/* Face */}
          {isBreak ? (
            <>
              {/* Happy closed eyes */}
              <path d="M222 259 Q224 256 226 259" stroke="#5A3A20" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M230 259 Q232 256 234 259" stroke="#5A3A20" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Happy mouth */}
              <motion.path
                d="M224 266 Q228 271 232 266"
                stroke="#D06060" strokeWidth="1.5" fill="none" strokeLinecap="round"
                className="animate-munch"
              />
              {/* Blush */}
              <circle cx="220" cy="264" r="3.5" fill="#F0A0A0" opacity="0.35" />
              <circle cx="236" cy="264" r="3.5" fill="#F0A0A0" opacity="0.35" />
            </>
          ) : (
            <>
              {/* Focused eyes */}
              <motion.g className="animate-blink" style={{ transformOrigin: '228px 259px' }}>
                <circle cx="223" cy="259" r="2" fill="#5A3A20" />
                <circle cx="233" cy="259" r="2" fill="#5A3A20" />
                {/* Eye highlights */}
                <circle cx="224" cy="258" r="0.7" fill="white" />
                <circle cx="234" cy="258" r="0.7" fill="white" />
              </motion.g>
              {/* Focused mouth - small line */}
              <line x1="226" y1="266" x2="231" y2="266" stroke="#B07060" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default DoraSvgScene;
