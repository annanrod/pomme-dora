import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import DoraSvgScene from '@/components/DoraSvgScene';
import TimerDisplay from '@/components/TimerDisplay';
import TimerControls from '@/components/TimerControls';
import SettingsPanel from '@/components/SettingsPanel';
import StatsPanel from '@/components/StatsPanel';

const MOTIVATIONAL = [
  "Every apple starts as a blossom 🌸",
  "Stay calm, stay focused 🍃",
  "You're growing stronger 🌱",
  "One session at a time 🍎",
  "Breathe and focus ✨",
  "Your tree appreciates you 🌳",
  "Rest well, work well 🌿",
];

const Index = () => {
  const {
    formattedTime, progress, isRunning, sessionType,
    sessionsCompleted, settings, stats,
    start, pause, reset, skip, updateSettings,
  } = usePomodoro();

  const [darkMode, setDarkMode] = useLocalStorage('pomme-dark-mode', false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Rotate motivational messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MOTIVATIONAL.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-4 py-6 overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-md flex items-center justify-between">
        <StatsPanel stats={stats} />
        <h1 className="font-display text-xl font-bold text-foreground">
          Pomme & Dora
        </h1>
        <SettingsPanel
          settings={settings}
          onUpdateSettings={updateSettings}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </header>

      {/* Scene */}
      <motion.div
        className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <DoraSvgScene
          sessionType={sessionType}
          isRunning={isRunning}
          treeLevel={stats.treeLevel}
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
      </motion.div>

      {/* Motivational Message */}
      <footer className="w-full max-w-md text-center pb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            className="text-xs text-muted-foreground font-body"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.4 }}
          >
            {MOTIVATIONAL[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </footer>
    </div>
  );
};

export default Index;
