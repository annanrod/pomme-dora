import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { PomodoroSettings } from '@/hooks/usePomodoro';

interface SettingsPanelProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsPanel = ({ settings, onUpdateSettings, darkMode, onToggleDarkMode }: SettingsPanelProps) => {
  const [local, setLocal] = useState(settings);

  const update = (key: keyof PomodoroSettings, value: number) => {
    const newSettings = { ...local, [key]: value };
    setLocal(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border">
        <SheetHeader>
          <SheetTitle className="font-display text-foreground">Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">Focus Duration: {local.focusMinutes} min</Label>
            <Slider
              value={[local.focusMinutes]}
              onValueChange={([v]) => update('focusMinutes', v)}
              min={5} max={60} step={5}
              className="w-full"
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">Short Break: {local.shortBreakMinutes} min</Label>
            <Slider
              value={[local.shortBreakMinutes]}
              onValueChange={([v]) => update('shortBreakMinutes', v)}
              min={1} max={15} step={1}
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">Long Break: {local.longBreakMinutes} min</Label>
            <Slider
              value={[local.longBreakMinutes]}
              onValueChange={([v]) => update('longBreakMinutes', v)}
              min={5} max={30} step={5}
            />
          </div>
          <div className="space-y-3">
            <Label className="font-body text-sm text-muted-foreground">Long Break After: {local.longBreakInterval} sessions</Label>
            <Slider
              value={[local.longBreakInterval]}
              onValueChange={([v]) => update('longBreakInterval', v)}
              min={2} max={8} step={1}
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onToggleDarkMode}
              className="w-full font-body"
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
