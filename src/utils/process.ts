import { spawn } from "child_process";
import type { Logger } from "../services/logger";

export function run(
  cmd: string,
  args: string[],
  cwd: string | undefined,
  logger: Logger | undefined,
  timeoutMs = 10 * 60 * 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      try {
        child.kill();
      } catch {}
      const msg = `${cmd} ${args.join(" ")} timed out after ${Math.round(timeoutMs / 1000)}s.\n${stderr || stdout}`;
      logger?.info(`[git-timeout] ${msg}`);
      reject(new Error(msg));
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      const s = d.toString();
      stdout += s;
      logger?.info(s.trimEnd());
    });

    child.stderr.on("data", (d) => {
      const s = d.toString();
      stderr += s;
      logger?.info(s.trimEnd());
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      logger?.info(`[spawn-error] ${String(err)}`);
      reject(err);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) return resolve();

      const msg = `${cmd} ${args.join(" ")} failed (code ${code}).\n${stderr || stdout}`;
      logger?.info(`[git-failed] ${msg}`);
      reject(new Error(msg));
    });
  });
}
