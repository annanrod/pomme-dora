import { Trophy, Flame, Clock, TreePine } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import type { PomodoroStats } from '@/types/pomodoro';

interface StatsPanelProps {
  stats: PomodoroStats;
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_session: '🍎',
  ten_sessions: '🌟',
  fifty_sessions: '👑',
  three_streak: '🔥',
  week_streak: '⚡',
  one_hour: '⏰',
  ten_hours: '🏆',
};

const StatsPanel = ({ stats }: StatsPanelProps) => {
  const { t } = useI18n();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label={t.stats.open} variant="ghost" size="icon" className="rounded-full">
          <Trophy className="w-5 h-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-foreground">{t.stats.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Clock className="w-4 h-4 text-secondary" />} label={t.stats.focusTime} value={`${Math.floor(stats.totalFocusMinutes / 60)}h ${stats.totalFocusMinutes % 60}m`} />
            <StatCard icon={<TreePine className="w-4 h-4 text-primary" />} label={t.stats.sessions} value={stats.totalSessions.toString()} />
            <StatCard icon={<Flame className="w-4 h-4 text-accent" />} label={t.stats.streak} value={`${stats.currentStreak} ${t.stats.days}`} />
            <StatCard icon={<Trophy className="w-4 h-4 text-secondary" />} label={t.stats.bestStreak} value={`${stats.bestStreak} ${t.stats.days}`} />
          </div>

          <div>
            <h3 className="font-display text-sm text-muted-foreground mb-3">{t.stats.achievements}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(ACHIEVEMENT_ICONS).map((key) => {
                const unlocked = stats.achievements.includes(key);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-body ${
                      unlocked ? 'bg-primary/10 text-foreground' : 'bg-muted text-muted-foreground opacity-50'
                    }`}
                  >
                    <span className="text-base">{ACHIEVEMENT_ICONS[key]}</span>
                    <span>{t.stats.achievementLabels[key as keyof typeof t.stats.achievementLabels]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-muted/50 rounded-xl p-3 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-xs font-body">{label}</span>
    </div>
    <span className="text-lg font-display font-bold text-foreground">{value}</span>
  </div>
);

export default StatsPanel;
