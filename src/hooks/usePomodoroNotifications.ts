import { useCallback } from 'react';

interface NotifySessionCompleteOptions {
  enabled: boolean;
  sessionType: 'focus' | 'shortBreak' | 'longBreak';
  focusCompleteTitle: string;
  focusCompleteBody: string;
  breakCompleteTitle: string;
  breakCompleteBody: string;
  motivationalBody: string;
}

export function usePomodoroNotifications() {
  const requestPermission = useCallback((enabled: boolean) => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'default') {
      return;
    }

    void Notification.requestPermission();
  }, []);

  const notifySessionComplete = useCallback((options: NotifySessionCompleteOptions) => {
    if (!options.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const title = options.sessionType === 'focus' ? options.focusCompleteTitle : options.breakCompleteTitle;
    const body = options.sessionType === 'focus' ? options.focusCompleteBody : options.breakCompleteBody;

    new Notification(title, { body: `${body}\n${options.motivationalBody}` });
  }, []);

  return {
    notifySessionComplete,
    requestPermission,
  };
}
