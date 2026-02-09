import { run } from "../utils/process";
import type { Logger } from "./logger";

export async function clone(
  repo: string,
  branch: string | undefined,
  targetFolder: string,
  logger: Logger
): Promise<void> {
  const args = ["clone"];
  if (branch?.trim()) {
    args.push("-b", branch.trim(), "--single-branch");
  }
  args.push(repo, targetFolder);
  await run("git", args, undefined, logger);
}

export async function fetch(repoFolder: string, logger: Logger): Promise<void> {
  await run("git", ["fetch", "--all", "--prune"], repoFolder, logger);
}

export async function checkout(repoFolder: string, branch: string, logger: Logger): Promise<void> {
  try {
    await run("git", ["checkout", branch], repoFolder, logger);
  } catch {
    await run("git", ["checkout", "-B", branch, `origin/${branch}`], repoFolder, logger);
  }
}
