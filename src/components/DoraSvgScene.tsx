import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useI18n } from '@/i18n';
import type { SessionType } from '@/hooks/usePomodoro';
import doraFocus from '@/assets/dora-focus.png';
import doraFocusDarkmode from '@/assets/dora-focus-darkmode.png';
import doraBreak from '@/assets/dora-break.png';
import doraBreakDarkmode from '@/assets/dora-break-darkmode.png';

interface DoraSvgSceneProps {
  sessionType: SessionType;
  isRunning: boolean;
  progress: number;
}

const DoraSvgScene = ({ sessionType }: DoraSvgSceneProps) => {
  const { resolvedTheme } = useTheme();
  const { t } = useI18n();
  const isBreak = sessionType !== 'focus';
  const isDarkMode = resolvedTheme === 'dark';
  const illustration = isBreak
    ? (isDarkMode ? doraBreakDarkmode : doraBreak)
    : (isDarkMode ? doraFocusDarkmode : doraFocus);
  const altText = isBreak
    ? (isDarkMode ? t.illustrations.breakDark : t.illustrations.breakLight)
    : (isDarkMode ? t.illustrations.focusDark : t.illustrations.focusLight);

  return (
    <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[23rem] md:max-w-[26rem] lg:max-w-[30rem]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isBreak ? 'break' : 'focus'}-${isDarkMode ? 'dark' : 'light'}`}
          className="relative aspect-square w-full"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <motion.img
            src={illustration}
            alt={altText}
            className="h-full w-full object-contain"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DoraSvgScene;
