import { useCallback, useRef, useState } from 'react';

export function usePomodoroHistory<T>(maxSize = 50) {
  const historyRef = useRef<T[]>([]);
  const [historyDepth, setHistoryDepth] = useState(0);

  const push = useCallback((entry: T) => {
    const nextHistory = [...historyRef.current, entry];
    historyRef.current = nextHistory.slice(-maxSize);
    setHistoryDepth(historyRef.current.length);
  }, [maxSize]);

  const pop = useCallback(() => {
    if (historyRef.current.length === 0) {
      return null;
    }

    const nextHistory = [...historyRef.current];
    const previous = nextHistory.pop() ?? null;
    historyRef.current = nextHistory;
    setHistoryDepth(nextHistory.length);
    return previous;
  }, []);

  const clear = useCallback(() => {
    historyRef.current = [];
    setHistoryDepth(0);
  }, []);

  return {
    push,
    pop,
    clear,
    canGoBack: historyDepth > 0,
  };
}
