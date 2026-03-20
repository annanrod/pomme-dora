import { useCallback, useEffect, useRef } from 'react';
import beepSound from '@/assets/beep.mp3';
import notificationSound from '@/assets/notification.mp3';

export function usePomodoroAudio() {
  const cycleAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountdownBeepRef = useRef<number | null>(null);

  useEffect(() => {
    cycleAudioRef.current = new Audio(notificationSound);
    cycleAudioRef.current.preload = 'auto';
    beepAudioRef.current = new Audio(beepSound);
    beepAudioRef.current.preload = 'auto';
    beepAudioRef.current.volume = 0.35;

    return () => {
      cycleAudioRef.current = null;
      beepAudioRef.current = null;
    };
  }, []);

  const primeCountdownAudio = useCallback(() => {
    if (beepAudioRef.current) {
      beepAudioRef.current.load();
    }
  }, []);

  const resetCountdownState = useCallback(() => {
    lastCountdownBeepRef.current = null;
  }, []);

  const playCountdownBeep = useCallback((second: number) => {
    if (!beepAudioRef.current || lastCountdownBeepRef.current === second) return;

    lastCountdownBeepRef.current = second;
    beepAudioRef.current.currentTime = 0;
    void beepAudioRef.current.play().catch(() => {
      // Browser autoplay restrictions can still block playback in some cases.
    });
  }, []);

  const playCycleSound = useCallback(() => {
    if (!cycleAudioRef.current) return;

    cycleAudioRef.current.currentTime = 0;
    void cycleAudioRef.current.play().catch(() => {
      // Browser autoplay restrictions can block playback until the user interacts.
    });
  }, []);

  return {
    playCountdownBeep,
    playCycleSound,
    primeCountdownAudio,
    resetCountdownState,
  };
}
