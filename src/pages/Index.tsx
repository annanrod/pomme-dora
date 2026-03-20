import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useI18n } from '@/i18n';
import DoraSvgScene from '@/components/DoraSvgScene';
import TimerDisplay from '@/components/TimerDisplay';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import StatsPanel from '@/components/StatsPanel';

const Index = () => {
  const {
    formattedTime, progress, isRunning, sessionType,
    sessionsCompleted, settings, stats,
    start, pause, reset, skip, updateSettings, resetSettings, resetStats,
  } = usePomodoro();

  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();
  const [messageIndex, setMessageIndex] = useState(0);
  const darkMode = resolvedTheme === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % t.motivational.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [t.motivational.length]);

  return (
    <div className="h-[100svh] w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,244,214,0.95)_0%,_rgba(252,242,223,0.88)_30%,_rgba(247,239,225,0.95)_60%,_rgba(244,235,220,1)_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(78,108,151,0.34)_0%,_rgba(35,52,83,0.92)_28%,_rgba(24,36,59,0.97)_62%,_rgba(17,25,41,1)_100%)]">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)_auto] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4 sm:pt-4 lg:px-8">
        <header className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3">
          <div className="justify-self-start">
            <StatsPanel stats={stats} />
          </div>
          <h1 className="text-center font-display text-base font-bold tracking-wide text-foreground sm:text-lg md:text-xl">
            {t.appName}
          </h1>
          <div className="justify-self-end">
            <SettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetSettings={resetSettings}
              onResetStats={resetStats}
              darkMode={darkMode}
              onToggleDarkMode={() => setTheme(darkMode ? 'light' : 'dark')}
            />
          </div>
        </header>

        <motion.main
          className="flex min-h-0 w-full flex-col items-center justify-evenly gap-3 overflow-hidden py-2 sm:gap-4 sm:py-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DoraSvgScene
            sessionType={sessionType}
            isRunning={isRunning}
            progress={progress}
          />

          <TimerDisplay
            formattedTime={formattedTime}
            progress={progress}
            sessionType={sessionType}
            sessionsCompleted={sessionsCompleted}
          />

          <TimerControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />
        </motion.main>

        <footer className="flex min-h-10 w-full items-end justify-center pt-2 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="max-w-[20rem] px-6 text-center font-body text-[11px] leading-tight font-medium text-muted-foreground sm:max-w-xl sm:text-xs"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4 }}
            >
              {t.motivational[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </footer>
      </div>
    </div>
  );
};

export default Index;
