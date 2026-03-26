"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export type MediaVideoItem = {
  id: string;
  name: string;
  key: string[];
  relPath: string;
};

type VideoPanelProps = {
  videos: MediaVideoItem[];
  selectedA: string | null;
  selectedB: string | null;
  allowDuplicate: boolean;
  onSelectedAChange: (value: string) => void;
  onSelectedBChange: (value: string) => void;
  onAllowDuplicateChange: (value: boolean) => void;
};

function toMediaUrl(key: string) {
  return `/api/media/videos/${key}`;
}

export function VideoPanel({
  videos,
  selectedA,
  selectedB,
  allowDuplicate,
  onSelectedAChange,
  onSelectedBChange,
  onAllowDuplicateChange,
}: VideoPanelProps) {
  const videoAOptions = allowDuplicate ? videos : videos.filter((v) => v.id !== selectedB);
  const videoBOptions = allowDuplicate ? videos : videos.filter((v) => v.id !== selectedA);
  const selectedVideoA = videos.find((v) => v.id === selectedA);
  const selectedVideoB = videos.find((v) => v.id === selectedB);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Dual Video Players</CardTitle>
        <div className="flex items-center justify-between rounded-md border p-3">
          <label htmlFor="allow-duplicate" className="text-sm font-medium">
            Allow duplicate video selection
          </label>
          <Switch
            id="allow-duplicate"
            checked={allowDuplicate}
            onCheckedChange={(checked) => onAllowDuplicateChange(Boolean(checked))}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Player 1</p>
          <Select value={selectedA ?? undefined} onValueChange={onSelectedAChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select first video" />
            </SelectTrigger>
            <SelectContent>
              {videoAOptions.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.relPath}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVideoA ? (
            <video className="w-full rounded-md bg-black" controls src={toMediaUrl(selectedVideoA.key.join("/"))} />
          ) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Select a video for Player 1.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Player 2</p>
          <Select value={selectedB ?? undefined} onValueChange={onSelectedBChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select second video" />
            </SelectTrigger>
            <SelectContent>
              {videoBOptions.map((video) => (
                <SelectItem key={video.id} value={video.id}>
                  {video.relPath}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedVideoB ? (
            <video className="w-full rounded-md bg-black" controls src={toMediaUrl(selectedVideoB.key.join("/"))} />
          ) : (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              Select a video for Player 2.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
