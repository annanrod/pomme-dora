import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import { cn } from '@/lib/utils';
import type { PomodoroSettings } from '@/types/pomodoro';

interface SettingsPanelProps {
  settings: PomodoroSettings;
  isRunning: boolean;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onResetSettings: () => void;
  onResetStats: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsPanel = ({ settings, isRunning, onUpdateSettings, onResetSettings, onResetStats, darkMode, onToggleDarkMode }: SettingsPanelProps) => {
  const { t } = useI18n();

  const update = <K extends keyof PomodoroSettings>(key: K, value: PomodoroSettings[K]) => {
    if (isRunning && (
      key === 'focusMinutes' ||
      key === 'shortBreakMinutes' ||
      key === 'longBreakMinutes' ||
      key === 'longBreakInterval'
    )) {
      return;
    }

    const newSettings = { ...settings, [key]: value };
    onUpdateSettings(newSettings);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label={t.settings.open} variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col bg-card border-border">
        <SheetHeader className="shrink-0 pr-10">
          <SheetTitle className="font-display text-foreground">{t.settings.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {isRunning ? (
            <div className="rounded-xl border border-border/70 bg-muted/35 px-3 py-3 text-sm font-body text-muted-foreground">
              {t.settings.pauseToEdit}
            </div>
          ) : null}

          <div className={cn("space-y-3", isRunning && "opacity-45")}>
            <Label className="font-body text-sm text-muted-foreground">{t.settings.focusDuration}: {settings.focusMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.focusMinutes]}
              onValueChange={([v]) => update('focusMinutes', v)}
              disabled={isRunning}
              min={5} max={60} step={5}
              className="w-full"
            />
          </div>
          <div className={cn("space-y-3", isRunning && "opacity-45")}>
            <Label className="font-body text-sm text-muted-foreground">{t.settings.shortBreak}: {settings.shortBreakMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.shortBreakMinutes]}
              onValueChange={([v]) => update('shortBreakMinutes', v)}
              disabled={isRunning}
              min={1} max={15} step={1}
            />
          </div>
          <div className={cn("space-y-3", isRunning && "opacity-45")}>
            <Label className="font-body text-sm text-muted-foreground">{t.settings.longBreak}: {settings.longBreakMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.longBreakMinutes]}
              onValueChange={([v]) => update('longBreakMinutes', v)}
              disabled={isRunning}
              min={5} max={30} step={5}
            />
          </div>
          <div className={cn("space-y-3", isRunning && "opacity-45")}>
            <Label className="font-body text-sm text-muted-foreground">{t.settings.longBreakAfter}: {settings.longBreakInterval} {t.settings.sessions}</Label>
            <Slider
              value={[settings.longBreakInterval]}
              onValueChange={([v]) => update('longBreakInterval', v)}
              disabled={isRunning}
              min={2} max={8} step={1}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.soundAlerts}</Label>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => update('soundEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.browserNotifications}</Label>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => update('notificationsEnabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.autoplay}</Label>
            <Switch
              checked={settings.autoplayEnabled}
              onCheckedChange={(checked) => update('autoplayEnabled', checked)}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={onResetSettings}
              className="mb-2 w-full font-body text-muted-foreground"
            >
              {t.settings.resetDefaults}
            </Button>
            <Button
              variant="ghost"
              onClick={onResetStats}
              className="mb-2 w-full font-body text-muted-foreground"
            >
              {t.settings.resetStats}
            </Button>
            <Button
              variant="outline"
              onClick={onToggleDarkMode}
              className="w-full font-body"
            >
              {darkMode ? t.settings.lightMode : t.settings.darkMode}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
