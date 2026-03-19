import { Trophy, Flame, Clock, TreePine } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { PomodoroStats } from '@/hooks/usePomodoro';

interface StatsPanelProps {
  stats: PomodoroStats;
}

const ACHIEVEMENT_INFO: Record<string, { label: string; icon: string }> = {
  first_session: { label: 'First Apple', icon: '🍎' },
  ten_sessions: { label: '10 Sessions', icon: '🌟' },
  fifty_sessions: { label: '50 Sessions', icon: '👑' },
  three_streak: { label: '3-Day Streak', icon: '🔥' },
  week_streak: { label: 'Week Streak', icon: '⚡' },
  one_hour: { label: '1 Hour Focused', icon: '⏰' },
  ten_hours: { label: '10 Hours Focused', icon: '🏆' },
};

const StatsPanel = ({ stats }: StatsPanelProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Trophy className="w-5 h-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-foreground">Your Progress</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Clock className="w-4 h-4 text-secondary" />} label="Focus Time" value={`${Math.floor(stats.totalFocusMinutes / 60)}h ${stats.totalFocusMinutes % 60}m`} />
            <StatCard icon={<TreePine className="w-4 h-4 text-primary" />} label="Sessions" value={stats.totalSessions.toString()} />
            <StatCard icon={<Flame className="w-4 h-4 text-accent" />} label="Streak" value={`${stats.currentStreak} days`} />
            <StatCard icon={<Trophy className="w-4 h-4 text-secondary" />} label="Best Streak" value={`${stats.bestStreak} days`} />
          </div>

          <div>
            <h3 className="font-display text-sm text-muted-foreground mb-3">Tree Level {stats.treeLevel}/10</h3>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary rounded-full h-2.5 transition-all duration-500"
                style={{ width: `${(stats.treeLevel / 10) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm text-muted-foreground mb-3">Achievements</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACHIEVEMENT_INFO).map(([key, info]) => {
                const unlocked = stats.achievements.includes(key);
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-body ${
                      unlocked ? 'bg-primary/10 text-foreground' : 'bg-muted text-muted-foreground opacity-50'
                    }`}
                  >
                    <span className="text-base">{info.icon}</span>
                    <span>{info.label}</span>
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
