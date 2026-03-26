"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

type SlideshowControlsProps = {
  isPlaying: boolean;
  loop: boolean;
  intervalMs: number;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLoopChange: (value: boolean) => void;
  onIntervalChange: (value: number) => void;
};

export function SlideshowControls({
  isPlaying,
  loop,
  intervalMs,
  onTogglePlay,
  onPrev,
  onNext,
  onLoopChange,
  onIntervalChange,
}: SlideshowControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slideshow Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button onClick={onTogglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
          <Button variant="outline" onClick={onNext}>
            Next
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Interval: {intervalMs / 1000}s</span>
        </div>
        <Slider
          min={2000}
          max={10000}
          step={1000}
          value={[intervalMs]}
          onValueChange={(value) => onIntervalChange(value[0] ?? 5000)}
        />
        <div className="flex items-center justify-between rounded-md border p-3">
          <span className="text-sm font-medium">Loop slideshow</span>
          <Switch checked={loop} onCheckedChange={(checked) => onLoopChange(Boolean(checked))} />
        </div>
      </CardContent>
    </Card>
  );
}
