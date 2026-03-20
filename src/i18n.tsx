import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

export type Locale = 'pt' | 'en';

function detectLocale(language?: string): Locale {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'pt';
}

const translations = {
  pt: {
    appName: 'Pomme & Dora',
    pageTitle: 'Pomme & Dora - Timer Pomodoro',
    motivational: [
      'Toda maçã começa como flor 🌸',
      'Respire fundo e mantenha o foco 🍃',
      'Você está ficando mais forte 🌱',
      'Uma sessão de cada vez 🍎',
      'Respire e se concentre ✨',
      'Sua árvore agradece 🌳',
      'Descansar bem também é produtividade 🌿',
    ],
    notifications: {
      focusCompleteTitle: '🍎 Foco concluído!',
      focusCompleteBody: 'Hora de fazer uma pausa!',
      breakCompleteTitle: '🌳 Pausa encerrada!',
      breakCompleteBody: 'Pronta para focar de novo?',
      motivational: [
        'Você está indo muito bem! 🌟',
        'Mantenha o foco, a Dora acredita em você! 🍎',
        'Uma maçã de cada vez! 🌳',
        'Sua árvore está crescendo! 🌱',
        'Foco é o seu superpoder! ✨',
        'Quase lá, continue! 💪',
        'Bom trabalho! Hora de descansar 🌸',
        'Você mereceu essa pausa! ☕',
      ],
    },
    timer: {
      focus: '🍎 Hora de focar',
      shortBreak: '🌿 Pausa curta',
      longBreak: '🌳 Pausa longa',
      sessions: 'sessões',
    },
    settings: {
      open: 'Abrir configurações',
      title: 'Configurações',
      focusDuration: 'Duração do foco',
      shortBreak: 'Pausa curta',
      longBreak: 'Pausa longa',
      longBreakAfter: 'Pausa longa após',
      minutes: 'min',
      sessions: 'sessões',
      resetDefaults: 'Restaurar pomodoro padrão',
      resetStats: 'Zerar estatísticas',
      lightMode: '☀️ Modo claro',
      darkMode: '🌙 Modo escuro',
    },
    controls: {
      reset: 'Resetar timer',
      start: 'Iniciar timer',
      pause: 'Pausar timer',
      skip: 'Pular sessão',
    },
    stats: {
      open: 'Abrir progresso',
      title: 'Seu progresso',
      focusTime: 'Tempo de foco',
      sessions: 'Sessões',
      streak: 'Sequência',
      bestStreak: 'Melhor sequência',
      days: 'dias',
      achievements: 'Conquistas',
      achievementLabels: {
        first_session: 'Primeira maçã',
        ten_sessions: '10 sessões',
        fifty_sessions: '50 sessões',
        three_streak: '3 dias seguidos',
        week_streak: '1 semana seguida',
        one_hour: '1 hora de foco',
        ten_hours: '10 horas de foco',
      },
    },
    illustrations: {
      breakDark: 'Dora descansando sob a lua',
      breakLight: 'Dora descansando e comendo uma maçã',
      focusDark: 'Dora lendo com uma lanterna sob a lua',
      focusLight: 'Dora focada lendo um livro',
    },
    notFound: {
      message: 'Ops! Página não encontrada',
      backHome: 'Voltar para a página inicial',
    },
  },
  en: {
    appName: 'Pomme & Dora',
    pageTitle: 'Pomme & Dora - Pomodoro Timer',
    motivational: [
      'Every apple starts as a blossom 🌸',
      'Take a breath and stay focused 🍃',
      'You are growing stronger 🌱',
      'One session at a time 🍎',
      'Breathe and focus ✨',
      'Your tree appreciates you 🌳',
      'Resting well matters too 🌿',
    ],
    notifications: {
      focusCompleteTitle: '🍎 Focus complete!',
      focusCompleteBody: 'Time for a break!',
      breakCompleteTitle: '🌳 Break over!',
      breakCompleteBody: 'Ready to focus again?',
      motivational: [
        "You're doing great! 🌟",
        'Stay focused, Dora believes in you! 🍎',
        'One apple at a time! 🌳',
        'Your tree is growing! 🌱',
        'Focus is your superpower! ✨',
        'Almost there, keep going! 💪',
        'Great work! Time to rest 🌸',
        'You earned this break! ☕',
      ],
    },
    timer: {
      focus: '🍎 Focus time',
      shortBreak: '🌿 Short break',
      longBreak: '🌳 Long break',
      sessions: 'sessions',
    },
    settings: {
      open: 'Open settings',
      title: 'Settings',
      focusDuration: 'Focus duration',
      shortBreak: 'Short break',
      longBreak: 'Long break',
      longBreakAfter: 'Long break after',
      minutes: 'min',
      sessions: 'sessions',
      resetDefaults: 'Reset default pomodoro',
      resetStats: 'Reset statistics',
      lightMode: '☀️ Light mode',
      darkMode: '🌙 Dark mode',
    },
    controls: {
      reset: 'Reset timer',
      start: 'Start timer',
      pause: 'Pause timer',
      skip: 'Skip session',
    },
    stats: {
      open: 'Open progress',
      title: 'Your progress',
      focusTime: 'Focus time',
      sessions: 'Sessions',
      streak: 'Streak',
      bestStreak: 'Best streak',
      days: 'days',
      achievements: 'Achievements',
      achievementLabels: {
        first_session: 'First apple',
        ten_sessions: '10 sessions',
        fifty_sessions: '50 sessions',
        three_streak: '3-day streak',
        week_streak: '1-week streak',
        one_hour: '1 hour focused',
        ten_hours: '10 hours focused',
      },
    },
    illustrations: {
      breakDark: 'Dora resting under the moon',
      breakLight: 'Dora resting and eating an apple',
      focusDark: 'Dora reading with a lantern under the moon',
      focusLight: 'Dora focused while reading a book',
    },
    notFound: {
      message: 'Oops! Page not found',
      backHome: 'Return to home',
    },
  },
} as const;

type I18nValue = {
  locale: Locale;
  t: (typeof translations)[Locale];
};

const I18nContext = createContext<I18nValue>({
  locale: 'pt',
  t: translations.pt,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = detectLocale(typeof navigator !== 'undefined' ? navigator.language : undefined);

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en';
    document.title = translations[locale].pageTitle;
  }, [locale]);

  const value = useMemo(() => ({ locale, t: translations[locale] }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
