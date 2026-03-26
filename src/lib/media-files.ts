import fs from "node:fs/promises";
import path from "node:path";
import { getKindDir, type MediaKind } from "@/lib/media-config";

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov"]);
const PHOTO_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export type MediaItem = {
  id: string;
  name: string;
  kind: MediaKind;
  key: string[];
  relPath: string;
  ext: string;
};

export type MediaCatalog = {
  videos: MediaItem[];
  photos: MediaItem[];
  missingDirs: MediaKind[];
};

async function walkDir(baseDir: string, currentDir = ""): Promise<string[]> {
  const target = path.join(baseDir, currentDir);
  const entries = await fs.readdir(target, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const rel = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(baseDir, rel)));
    } else if (entry.isFile()) {
      files.push(rel);
    }
  }

  return files;
}

function toMediaItem(kind: MediaKind, relPath: string): MediaItem {
  const parsed = path.parse(relPath);
  const key = relPath.split(path.sep).filter(Boolean);
  return {
    id: `${kind}:${relPath}`,
    name: parsed.name,
    kind,
    key,
    relPath,
    ext: parsed.ext.toLowerCase(),
  };
}

async function readKind(kind: MediaKind): Promise<{ items: MediaItem[]; missing: boolean }> {
  const dir = getKindDir(kind);
  try {
    const fileRelPaths = await walkDir(dir);
    const allowed = kind === "videos" ? VIDEO_EXTS : PHOTO_EXTS;
    const items = fileRelPaths
      .map((relPath) => toMediaItem(kind, relPath))
      .filter((item) => allowed.has(item.ext))
      .sort((a, b) => a.relPath.localeCompare(b.relPath));
    return { items, missing: false };
  } catch (error) {
    const maybeErr = error as NodeJS.ErrnoException;
    if (maybeErr.code === "ENOENT") {
      return { items: [], missing: true };
    }
    throw error;
  }
}

export async function getMediaCatalog(): Promise<MediaCatalog> {
  const [videos, photos] = await Promise.all([readKind("videos"), readKind("photos")]);
  const missingDirs: MediaKind[] = [];

  if (videos.missing) missingDirs.push("videos");
  if (photos.missing) missingDirs.push("photos");

  return {
    videos: videos.items,
    photos: photos.items,
    missingDirs,
  };
}

export async function resolveMediaFile(kind: MediaKind, slug: string[]): Promise<string> {
  const cleanSlug = slug.filter(Boolean);
  const requested = path.resolve(getKindDir(kind), ...cleanSlug);
  const rootKindDir = path.resolve(getKindDir(kind));
  const relative = path.relative(rootKindDir, requested);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid media path");
  }
  await fs.access(requested);
  return requested;
}
