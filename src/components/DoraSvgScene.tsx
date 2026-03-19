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
      const hitsHead = Math.random() < 0.4;
      const newApple: FallingApple = {
        id: Date.now(),
        x: hitsHead ? 215 : 140 + Math.random() * 80,
        hitsHead,
      };
      setFallingApples(prev => [...prev.slice(-3), newApple]);
      if (hitsHead) {
        setTimeout(() => setHeadBounce(true), 1500);
        setTimeout(() => setHeadBounce(false), 1900);
      }
    }, 4500 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const treeScale = 0.85 + (treeLevel / 10) * 0.15;
  const appleCount = Math.max(1, Math.floor(treeLevel / 2));

  return (
    <div className="relative w-full max-w-[420px] mx-auto" style={{ aspectRatio: '1/1' }}>
      <motion.svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Watercolor-style gradients */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#FFF8F0' : '#F5F0E8' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#FFF2E0' : '#EDE8DD' }} transition={{ duration: 1.5 }} />
          </linearGradient>

          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#D4E8B0' : '#C0D8A0' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#B8D890' : '#A8C888' }} transition={{ duration: 1.5 }} />
          </linearGradient>

          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A08868" />
            <stop offset="40%" stopColor="#B09878" />
            <stop offset="100%" stopColor="#907858" />
          </linearGradient>

          <radialGradient id="canopyGrad" cx="45%" cy="38%" r="55%">
            <motion.stop offset="0%" animate={{ stopColor: isBreak ? '#C8E8A0' : '#B0D890' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="50%" animate={{ stopColor: isBreak ? '#A0D080' : '#90C070' }} transition={{ duration: 1.5 }} />
            <motion.stop offset="100%" animate={{ stopColor: isBreak ? '#80B860' : '#70A858' }} transition={{ duration: 1.5 }} />
          </radialGradient>

          <radialGradient id="canopyHighlight" cx="38%" cy="32%" r="45%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="appleGrad" cx="38%" cy="32%" r="50%">
            <stop offset="0%" stopColor="#F07060" />
            <stop offset="100%" stopColor="#E04840" />
          </radialGradient>

          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="1" dy="2" />
            <feComponentTransfer><feFuncA type="linear" slope="0.1" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Watercolor texture filter */}
          <filter id="watercolor" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="400" height="320" fill="url(#skyGrad)" rx="12" />

        {/* Ground - soft grassy hill */}
        <ellipse cx="200" cy="330" rx="230" ry="45" fill="url(#groundGrad)" />
        <rect x="0" y="330" width="400" height="70" fill="url(#groundGrad)" />
        {/* Ground texture - grass strokes */}
        {[40, 80, 120, 280, 320, 360].map((x, i) => (
          <motion.g key={`grass-${i}`} className="animate-leaf" style={{ animationDelay: `${i * 0.8}s` }}>
            <path d={`M${x} 328 Q${x - 3} 318 ${x + 2} 314`} stroke="#7AAA60" strokeWidth="1.5" fill="none" opacity="0.35" strokeLinecap="round" />
            <path d={`M${x + 6} 330 Q${x + 9} 322 ${x + 5} 318`} stroke="#7AAA60" strokeWidth="1.2" fill="none" opacity="0.25" strokeLinecap="round" />
          </motion.g>
        ))}

        {/* Small flowers */}
        {[{ x: 60, c: '#F2A0B0' }, { x: 320, c: '#E8C870' }, { x: 350, c: '#C0A0D0' }].map((f, i) => (
          <g key={`flower-${i}`}>
            <line x1={f.x} y1={330} x2={f.x} y2={320} stroke="#7AAA60" strokeWidth="1" />
            <circle cx={f.x} cy={318} r="2.5" fill={f.c} opacity="0.5" />
            <circle cx={f.x} cy={318} r="1.2" fill="#FFE8A0" opacity="0.7" />
          </g>
        ))}

        {/* ===== TREE (centered, larger) ===== */}
        <motion.g
          animate={{ scale: treeScale }}
          style={{ transformOrigin: '185px 330px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Trunk - organic, slightly curved */}
          <path d="M178 210 Q175 260 172 330 L198 332 Q195 260 192 210" fill="url(#trunkGrad)" />
          {/* Trunk bark texture */}
          <path d="M180 240 Q185 238 188 240" stroke="#806848" strokeWidth="0.8" fill="none" opacity="0.3" />
          <path d="M179 265 Q184 263 190 266" stroke="#806848" strokeWidth="0.8" fill="none" opacity="0.25" />
          <path d="M177 290 Q183 287 192 290" stroke="#806848" strokeWidth="0.8" fill="none" opacity="0.2" />
          {/* Trunk base roots */}
          <path d="M172 328 Q165 332 158 330" stroke="#907858" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
          <path d="M198 330 Q205 334 212 331" stroke="#907858" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />

          {/* Branches */}
          <path d="M185 230 Q165 215 148 208" stroke="#907858" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M185 218 Q205 205 222 196" stroke="#907858" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M185 250 Q168 240 152 236" stroke="#907858" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M185 210 Q175 195 165 188" stroke="#907858" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* Canopy - large, organic, cloud-like foliage */}
          <motion.g className="animate-sway" style={{ transformOrigin: '185px 160px' }}>
            {/* Main foliage masses - overlapping soft blobs */}
            <ellipse cx="185" cy="155" rx="80" ry="65" fill="url(#canopyGrad)" />
            <ellipse cx="145" cy="148" rx="52" ry="42" fill="url(#canopyGrad)" opacity="0.85" />
            <ellipse cx="225" cy="145" rx="48" ry="40" fill="url(#canopyGrad)" opacity="0.85" />
            <ellipse cx="185" cy="128" rx="45" ry="35" fill="url(#canopyGrad)" opacity="0.8" />
            <ellipse cx="160" cy="170" rx="40" ry="30" fill="url(#canopyGrad)" opacity="0.75" />
            <ellipse cx="210" cy="168" rx="38" ry="28" fill="url(#canopyGrad)" opacity="0.75" />
            {/* Top bumps */}
            <ellipse cx="170" cy="105" rx="28" ry="22" fill="url(#canopyGrad)" opacity="0.7" />
            <ellipse cx="200" cy="100" rx="30" ry="24" fill="url(#canopyGrad)" opacity="0.65" />

            {/* Highlight shimmer */}
            <ellipse cx="165" cy="135" rx="35" ry="28" fill="url(#canopyHighlight)" />

            {/* Subtle leaf texture lines */}
            <path d="M150 140 Q160 135 170 140" stroke="#60A050" strokeWidth="0.8" fill="none" opacity="0.2" />
            <path d="M195 130 Q205 125 215 130" stroke="#60A050" strokeWidth="0.8" fill="none" opacity="0.2" />
            <path d="M140 160 Q150 155 160 160" stroke="#60A050" strokeWidth="0.8" fill="none" opacity="0.15" />

            {/* Small leaves poking out */}
            <path d="M120 150 Q115 145 118 140" stroke="#80B860" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M250 142 Q255 137 252 132" stroke="#80B860" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
            <path d="M130 168 Q125 163 128 158" stroke="#80B860" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />

            {/* Apples on tree */}
            {[
              { cx: 155, cy: 148 },
              { cx: 215, cy: 142 },
              { cx: 185, cy: 118 },
              { cx: 200, cy: 170 },
              { cx: 160, cy: 175 },
            ].slice(0, appleCount).map((pos, i) => (
              <g key={`apple-${i}`}>
                <circle cx={pos.cx} cy={pos.cy} r="7" fill="url(#appleGrad)" />
                {/* Stem */}
                <path d={`M${pos.cx} ${pos.cy - 6} Q${pos.cx + 1} ${pos.cy - 10} ${pos.cx + 3} ${pos.cy - 11}`} stroke="#5A8040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                {/* Leaf on stem */}
                <path d={`M${pos.cx + 2} ${pos.cy - 10} Q${pos.cx + 6} ${pos.cy - 12} ${pos.cx + 4} ${pos.cy - 8}`} fill="#7AAA60" opacity="0.6" />
                {/* Shine */}
                <ellipse cx={pos.cx - 2} cy={pos.cy - 2} rx="2" ry="1.5" fill="white" opacity="0.35" />
              </g>
            ))}
          </motion.g>
        </motion.g>

        {/* Falling Apples with sparkle */}
        <AnimatePresence>
          {fallingApples.map(apple => (
            <motion.g
              key={apple.id}
              initial={{ y: 0, opacity: 1, rotate: 0 }}
              animate={{
                y: apple.hitsHead ? 100 : 130,
                opacity: [1, 1, 0.8, 0],
                rotate: [0, 10, 20, 30],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: 'easeIn' }}
            >
              <circle cx={apple.x} cy={170} r="6" fill="url(#appleGrad)" />
              <ellipse cx={apple.x - 2} cy={168} rx="1.8" ry="1.2" fill="white" opacity="0.35" />
              {/* Sparkle trail */}
              {apple.hitsHead && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <line x1={apple.x - 6} y1={262} x2={apple.x - 10} y2={256} stroke="#FFD060" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={apple.x + 6} y1={260} x2={apple.x + 10} y2={254} stroke="#FFD060" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1={apple.x} y1={258} x2={apple.x} y2={252} stroke="#FFD060" strokeWidth="1.2" strokeLinecap="round" />
                </motion.g>
              )}
            </motion.g>
          ))}
        </AnimatePresence>

        {/* ===== DORA - sitting sideways, leaning against tree ===== */}
        <motion.g
          animate={{ y: headBounce ? -8 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 10 }}
          filter="url(#softShadow)"
        >
          {/* Shadow on ground */}
          <ellipse cx="220" cy="335" rx="22" ry="5" fill="#5A8050" opacity="0.12" />

          {/* Legs - stretched forward */}
          <path d="M212 322 Q205 330 195 336" stroke="#F0C8A8" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M218 324 Q212 332 202 338" stroke="#F0C8A8" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* Shoes */}
          <ellipse cx="193" cy="338" rx="6" ry="3.5" fill="#8B7355" />
          <ellipse cx="200" cy="340" rx="6" ry="3.5" fill="#8B7355" />

          {/* Body / Yellow top (like reference) */}
          <motion.path
            d="M208 305 Q210 292 218 286 Q226 290 228 305 L230 322 Q218 328 206 322 Z"
            animate={{ fill: isBreak ? '#F0D060' : '#F0D060' }}
            transition={{ duration: 1 }}
          />
          {/* Top detail - small dots on shirt */}
          <circle cx="216" cy="300" r="1" fill="#E0B840" opacity="0.5" />
          <circle cx="222" cy="296" r="1" fill="#E0B840" opacity="0.5" />
          <circle cx="218" cy="308" r="1" fill="#E0B840" opacity="0.4" />
          {/* Collar */}
          <path d="M214 289 Q218 291 222 289" stroke="#E8C840" strokeWidth="1" fill="none" opacity="0.5" />

          {/* Arms */}
          {isBreak ? (
            <>
              {/* Left arm resting */}
              <path d="M210 300 Q204 308 198 312" stroke="#F0C8A8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Right arm resting */}
              <path d="M226 302 Q232 310 236 314" stroke="#F0C8A8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Apple in right hand - eating */}
              <motion.g
                animate={{ y: [0, -1, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ transformOrigin: '240px 310px' }}
              >
                <circle cx="240" cy="312" r="6" fill="url(#appleGrad)" />
                <ellipse cx="238" cy="310" rx="1.8" ry="1.2" fill="white" opacity="0.3" />
                <path d="M240 306 Q241 303 243 302" stroke="#5A8040" strokeWidth="1" fill="none" strokeLinecap="round" />
              </motion.g>
              {/* Book on the ground beside her */}
              <g>
                <rect x="240" y="328" width="22" height="16" rx="2" fill="#A0C8E0" opacity="0.7" transform="rotate(-8 251 336)" />
                <rect x="241" y="329" width="20" height="14" rx="1.5" fill="#B8D8F0" opacity="0.6" transform="rotate(-8 251 336)" />
                <line x1="251" y1="329" x2="251" y2="343" stroke="#88B0C8" strokeWidth="0.8" opacity="0.4" transform="rotate(-8 251 336)" />
              </g>
            </>
          ) : (
            <>
              {/* Both arms holding book in front */}
              <path d="M210 298 Q204 304 200 310" stroke="#F0C8A8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              <path d="M226 300 Q230 306 234 310" stroke="#F0C8A8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
              {/* Book in hands */}
              <g>
                <rect x="196" y="304" width="24" height="18" rx="2" fill="#A0C8E0" transform="rotate(-5 208 313)" />
                <rect x="197" y="305" width="22" height="16" rx="1.5" fill="#D0E8F8" transform="rotate(-5 208 313)" />
                {/* Book spine */}
                <line x1="208" y1="305" x2="208" y2="321" stroke="#88B0C8" strokeWidth="0.8" transform="rotate(-5 208 313)" />
                {/* Text lines */}
                <line x1="200" y1="310" x2="206" y2="310" stroke="#90B0C0" strokeWidth="0.6" opacity="0.5" transform="rotate(-5 208 313)" />
                <line x1="200" y1="313" x2="205" y2="313" stroke="#90B0C0" strokeWidth="0.6" opacity="0.4" transform="rotate(-5 208 313)" />
                <line x1="210" y1="310" x2="216" y2="310" stroke="#90B0C0" strokeWidth="0.6" opacity="0.5" transform="rotate(-5 208 313)" />
                <line x1="210" y1="313" x2="215" y2="313" stroke="#90B0C0" strokeWidth="0.6" opacity="0.4" transform="rotate(-5 208 313)" />
              </g>
            </>
          )}

          {/* Head */}
          <circle cx="218" cy="272" r="18" fill="#F0C8A8" />

          {/* Hair - bob/chanel style, loose */}
          {/* Back hair mass */}
          <path d="M200 272 Q198 258 204 250 Q212 242 218 240 Q224 242 232 250 Q238 258 236 272 Q236 286 234 290"
            fill="#6B4930" />
          {/* Left side hair flowing down */}
          <path d="M200 272 Q198 282 200 292 Q202 296 204 294 Q204 284 202 274"
            fill="#6B4930" />
          {/* Right side hair flowing down */}
          <path d="M236 272 Q238 282 236 292 Q234 296 232 294 Q232 284 234 274"
            fill="#6B4930" />
          {/* Hair front bangs */}
          <path d="M206 258 Q210 248 218 246 Q226 248 230 258"
            fill="#7A5838" />
          {/* Hair highlight */}
          <path d="M210 250 Q214 246 218 248" stroke="#8B6840" strokeWidth="1" fill="none" opacity="0.4" />
          <path d="M222 248 Q226 246 228 250" stroke="#8B6840" strokeWidth="1" fill="none" opacity="0.35" />
          {/* Hair band/clip */}
          <circle cx="234" cy="262" r="2" fill="#F0D060" opacity="0.8" />

          {/* Face */}
          {isBreak ? (
            <>
              {/* Happy closed eyes - arcs */}
              <path d="M211 271 Q213 268 215 271" stroke="#5A3A20" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M221 271 Q223 268 225 271" stroke="#5A3A20" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              {/* Happy smile */}
              <motion.path
                d="M213 278 Q218 283 223 278"
                stroke="#D06060" strokeWidth="1.5" fill="none" strokeLinecap="round"
                className="animate-munch"
              />
              {/* Blush */}
              <circle cx="209" cy="276" r="4" fill="#F0A0A0" opacity="0.3" />
              <circle cx="227" cy="276" r="4" fill="#F0A0A0" opacity="0.3" />
            </>
          ) : (
            <>
              {/* Focused eyes - looking at book */}
              <motion.g className="animate-blink" style={{ transformOrigin: '218px 271px' }}>
                <circle cx="212" cy="271" r="2.2" fill="#5A3A20" />
                <circle cx="224" cy="271" r="2.2" fill="#5A3A20" />
                {/* Eye highlights */}
                <circle cx="213" cy="270" r="0.8" fill="white" />
                <circle cx="225" cy="270" r="0.8" fill="white" />
              </motion.g>
              {/* Focused mouth - small */}
              <line x1="215" y1="278" x2="221" y2="278" stroke="#B07060" strokeWidth="1.5" strokeLinecap="round" />
              {/* Slight blush when focused too */}
              <circle cx="209" cy="276" r="3" fill="#F0A0A0" opacity="0.15" />
              <circle cx="227" cy="276" r="3" fill="#F0A0A0" opacity="0.15" />
            </>
          )}
        </motion.g>
      </motion.svg>
    </div>
  );
};

export default DoraSvgScene;
