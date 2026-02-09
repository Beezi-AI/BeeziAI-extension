import * as vscode from "vscode";
import type { BeeziParams } from "../types";

export function parseParams(uri: vscode.Uri): BeeziParams {
  const q = new URLSearchParams(uri.query);

  const repo = q.get("repo") || "";
  const branch = q.get("branch") || undefined;
  const folderName = q.get("folder") || undefined;
  const openPath = q.get("path") || undefined;

  return { repo, branch, folderName, openPath };
}

export function normalizeRepoUrl(repo: string): string {
  return repo.replace(/ /g, "%20");
}

export function repoToFolderName(repoUrl: string): string {
  const cleaned = repoUrl.replace(/\/+$/, "");
  const last = cleaned.split(/[\\/:]/).pop() || "repo";
  return last.replace(/\.git$/i, "") || "repo";
}
