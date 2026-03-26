import path from "node:path";

export type MediaKind = "videos" | "photos";

const DEFAULT_STUFF_ROOT =
  process.platform === "win32" ? "C:\\Users\\Public\\stuff" : "/user/stuff";

export function getStuffRoot(): string {
  const configured = process.env.STUFF_ROOT?.trim();
  return path.resolve(configured || DEFAULT_STUFF_ROOT);
}

export function getKindDir(kind: MediaKind): string {
  return path.join(getStuffRoot(), kind);
}

export function normalizeSafePath(fullPath: string): string {
  return path.normalize(fullPath);
}

export function assertInsideRoot(candidatePath: string): void {
  const root = getStuffRoot();
  const relative = path.relative(root, normalizeSafePath(candidatePath));
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path escapes STUFF_ROOT");
  }
}
