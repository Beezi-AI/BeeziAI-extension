import * as path from "path";
import * as fs from "fs";

export async function ensureDir(p: string): Promise<void> {
  await fs.promises.mkdir(p, { recursive: true });
}

export function safeRelativePath(p: string): string {
  const normalized = p.replace(/\\/g, "/").replace(/^\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  const safeParts = parts.filter((x) => x !== ".." && x !== ".");
  return safeParts.join(path.sep);
}
