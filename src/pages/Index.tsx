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
    <div className="min-h-screen flex flex-col items-center justify-between overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,244,214,0.95)_0%,_rgba(252,242,223,0.88)_30%,_rgba(247,239,225,0.95)_60%,_rgba(244,235,220,1)_100%)] px-4 py-6 dark:bg-[radial-gradient(circle_at_top,_rgba(78,108,151,0.34)_0%,_rgba(35,52,83,0.92)_28%,_rgba(24,36,59,0.97)_62%,_rgba(17,25,41,1)_100%)]">
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between">
        <StatsPanel stats={stats} />
        <h1 className="font-display text-lg font-bold text-foreground tracking-wide">
          {t.appName}
        </h1>
        <SettingsPanel
          settings={settings}
          onUpdateSettings={updateSettings}
          onResetSettings={resetSettings}
          onResetStats={resetStats}
          darkMode={darkMode}
          onToggleDarkMode={() => setTheme(darkMode ? 'light' : 'dark')}
        />
      </header>

      {/* Main content */}
      <motion.div
        className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-2"
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

        <div className="mt-2">
          <TimerControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />
        </div>
      </motion.div>

      {/* Footer message */}
      <footer className="w-full max-w-md text-center pb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-xs text-muted-foreground font-body font-medium"
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
  );
};

export default Index;
