import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { resolveMediaFile } from "@/lib/media-files";
import type { MediaKind } from "@/lib/media-config";

const MIME_MAP: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function parseKind(input: string): MediaKind | null {
  return input === "videos" || input === "photos" ? input : null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ kind: string; slug: string[] }> },
) {
  try {
    const { kind: rawKind, slug } = await context.params;
    const kind = parseKind(rawKind);
    if (!kind) {
      return NextResponse.json({ error: "Invalid media kind" }, { status: 400 });
    }

    const fullPath = await resolveMediaFile(kind, slug);
    const ext = path.extname(fullPath).toLowerCase();
    const mime = MIME_MAP[ext] ?? "application/octet-stream";
    const stat = await fs.stat(fullPath);
    const fileBuffer = await fs.readFile(fullPath);

    if (kind === "videos") {
      const range = request.headers.get("range");
      if (range) {
        const match = /bytes=(\d*)-(\d*)/.exec(range);
        const start = match?.[1] ? Number(match[1]) : 0;
        const end = match?.[2] ? Number(match[2]) : stat.size - 1;
        const chunkStart = Number.isFinite(start) ? start : 0;
        const chunkEnd = Number.isFinite(end) ? end : stat.size - 1;
        const boundedEnd = Math.min(chunkEnd, stat.size - 1);
        const chunk = fileBuffer.subarray(chunkStart, boundedEnd + 1);
        return new NextResponse(chunk, {
          status: 206,
          headers: {
            "Content-Type": mime,
            "Content-Length": String(chunk.length),
            "Accept-Ranges": "bytes",
            "Content-Range": `bytes ${chunkStart}-${boundedEnd}/${stat.size}`,
            "Cache-Control": "no-store",
          },
        });
      }
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(stat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const maybeErr = error as NodeJS.ErrnoException;
    if (maybeErr.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        error: "Unable to serve media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
