import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useI18n } from '@/i18n';
import type { PomodoroSettings } from '@/hooks/usePomodoro';

interface SettingsPanelProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onResetSettings: () => void;
  onResetStats: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsPanel = ({ settings, onUpdateSettings, onResetSettings, onResetStats, darkMode, onToggleDarkMode }: SettingsPanelProps) => {
  const { t } = useI18n();

  const update = (key: keyof PomodoroSettings, value: number) => {
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
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-foreground">{t.settings.title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.focusDuration}: {settings.focusMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.focusMinutes]}
              onValueChange={([v]) => update('focusMinutes', v)}
              min={5} max={60} step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.shortBreak}: {settings.shortBreakMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.shortBreakMinutes]}
              onValueChange={([v]) => update('shortBreakMinutes', v)}
              min={1} max={15} step={1}
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.longBreak}: {settings.longBreakMinutes} {t.settings.minutes}</Label>
            <Slider
              value={[settings.longBreakMinutes]}
              onValueChange={([v]) => update('longBreakMinutes', v)}
              min={5} max={30} step={5}
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">{t.settings.longBreakAfter}: {settings.longBreakInterval} {t.settings.sessions}</Label>
            <Slider
              value={[settings.longBreakInterval]}
              onValueChange={([v]) => update('longBreakInterval', v)}
              min={2} max={8} step={1}
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
