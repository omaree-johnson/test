"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  title: string | null;
};

export function Lightbox({ open, onOpenChange, src, title }: LightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title ?? "Preview"}</DialogTitle>
          <DialogDescription>Selected image preview.</DialogDescription>
        </DialogHeader>
        {src ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border">
            <Image src={src} alt={title ?? "Selected photo"} fill className="object-contain" />
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-8 text-sm text-muted-foreground">
            Select a photo to preview.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
