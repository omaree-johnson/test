"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type MediaPhotoItem = {
  id: string;
  name: string;
  key: string[];
  relPath: string;
};

type GalleryPanelProps = {
  photos: MediaPhotoItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenLightbox: () => void;
};

function toPhotoUrl(key: string) {
  return `/api/media/photos/${key}`;
}

export function GalleryPanel({ photos, selectedId, onSelect, onOpenLightbox }: GalleryPanelProps) {
  const selectedPhoto = photos.find((photo) => photo.id === selectedId) ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Gallery</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedPhoto ? (
          <button
            type="button"
            onClick={onOpenLightbox}
            className="relative block aspect-video w-full overflow-hidden rounded-md border"
          >
            <Image
              src={toPhotoUrl(selectedPhoto.key.join("/"))}
              alt={selectedPhoto.name}
              fill
              className="object-contain"
            />
          </button>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            Select a photo to preview.
          </div>
        )}

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo.id)}
                className={`relative aspect-square overflow-hidden rounded-md border ${
                  selectedId === photo.id ? "ring-2 ring-primary" : ""
                }`}
                title={photo.relPath}
              >
                <Image src={toPhotoUrl(photo.key.join("/"))} alt={photo.name} fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No photos found in <code>photos/</code>.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
