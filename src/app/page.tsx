"use client";

import { useEffect, useMemo, useState } from "react";
import { GalleryPanel, type MediaPhotoItem } from "@/components/media/gallery-panel";
import { Lightbox } from "@/components/media/lightbox";
import { SlideshowControls } from "@/components/media/slideshow-controls";
import { VideoPanel, type MediaVideoItem } from "@/components/media/video-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MediaApiResponse = {
  stuffRoot: string;
  videos: MediaVideoItem[];
  photos: MediaPhotoItem[];
  missingDirs: ("videos" | "photos")[];
  error?: string;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stuffRoot, setStuffRoot] = useState<string>("");
  const [videos, setVideos] = useState<MediaVideoItem[]>([]);
  const [photos, setPhotos] = useState<MediaPhotoItem[]>([]);
  const [missingDirs, setMissingDirs] = useState<string[]>([]);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [selectedVideoA, setSelectedVideoA] = useState<string | null>(null);
  const [selectedVideoB, setSelectedVideoB] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(5000);
  const [loop, setLoop] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadMedia() {
      try {
        setLoading(true);
        const res = await fetch("/api/media", { cache: "no-store" });
        const data = (await res.json()) as MediaApiResponse;
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to load media");
        }
        if (!active) return;

        setStuffRoot(data.stuffRoot);
        setVideos(data.videos);
        setPhotos(data.photos);
        setMissingDirs(data.missingDirs);
        setSelectedVideoA(data.videos[0]?.id ?? null);
        setSelectedVideoB(data.videos[1]?.id ?? data.videos[0]?.id ?? null);
        setSelectedPhoto(data.photos[0]?.id ?? null);
      } catch (loadErr) {
        if (!active) return;
        setError(loadErr instanceof Error ? loadErr.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMedia();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedPhoto || photos.length === 0 || !isPlaying) return;
    const timer = setInterval(() => {
      const current = photos.findIndex((p) => p.id === selectedPhoto);
      if (current < 0) return;
      const next = current + 1;
      if (next < photos.length) {
        setSelectedPhoto(photos[next].id);
      } else if (loop) {
        setSelectedPhoto(photos[0].id);
      } else {
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [selectedPhoto, photos, isPlaying, intervalMs, loop]);

  const selectedPhotoItem = useMemo(
    () => photos.find((photo) => photo.id === selectedPhoto) ?? null,
    [photos, selectedPhoto],
  );

  const photoSrc = selectedPhotoItem ? `/api/media/photos/${selectedPhotoItem.key.join("/")}` : null;

  function pickNextPhoto(step: 1 | -1) {
    if (photos.length === 0) return;
    const current = photos.findIndex((photo) => photo.id === selectedPhoto);
    const baseIndex = current >= 0 ? current : 0;
    const next = baseIndex + step;

    if (next >= 0 && next < photos.length) {
      setSelectedPhoto(photos[next].id);
      return;
    }
    if (loop) {
      setSelectedPhoto(step > 0 ? photos[0].id : photos[photos.length - 1].id);
    }
  }

  function updateVideoA(nextId: string) {
    setSelectedVideoA(nextId);
    if (!allowDuplicate && nextId === selectedVideoB) {
      const alternative = videos.find((video) => video.id !== nextId);
      setSelectedVideoB(alternative?.id ?? nextId);
    }
  }

  function updateVideoB(nextId: string) {
    setSelectedVideoB(nextId);
    if (!allowDuplicate && nextId === selectedVideoA) {
      const alternative = videos.find((video) => video.id !== nextId);
      setSelectedVideoA(alternative?.id ?? nextId);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Local Media Viewer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Media root: <code>{stuffRoot || "Loading..."}</code>
            </p>
            {missingDirs.length > 0 ? (
              <p className="mt-2">
                Missing folders: <code>{missingDirs.join(", ")}</code>
              </p>
            ) : null}
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Loading videos and photos...</CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card>
            <CardContent className="p-6 text-sm text-destructive">Error loading media: {error}</CardContent>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <VideoPanel
                videos={videos}
                selectedA={selectedVideoA}
                selectedB={selectedVideoB}
                allowDuplicate={allowDuplicate}
                onSelectedAChange={updateVideoA}
                onSelectedBChange={updateVideoB}
                onAllowDuplicateChange={setAllowDuplicate}
              />
            </div>
            <div className="space-y-4">
              <Tabs defaultValue="gallery" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                  <TabsTrigger value="slideshow">Slideshow</TabsTrigger>
                </TabsList>
                <TabsContent value="gallery" className="mt-4">
                  <GalleryPanel
                    photos={photos}
                    selectedId={selectedPhoto}
                    onSelect={setSelectedPhoto}
                    onOpenLightbox={() => setLightboxOpen(true)}
                  />
                </TabsContent>
                <TabsContent value="slideshow" className="mt-4">
                  <SlideshowControls
                    isPlaying={isPlaying}
                    loop={loop}
                    intervalMs={intervalMs}
                    onTogglePlay={() => setIsPlaying((value) => !value)}
                    onPrev={() => pickNextPhoto(-1)}
                    onNext={() => pickNextPhoto(1)}
                    onLoopChange={setLoop}
                    onIntervalChange={setIntervalMs}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : null}
      </div>

      <Lightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={photoSrc}
        title={selectedPhotoItem?.relPath ?? null}
      />
    </main>
  );
}
