import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { EXT_ID, ROUTE_OPEN } from "../constants";
import type { Logger } from "../services/logger";
import { getBaseFolder, shouldAlwaysAsk } from "../services/config";
import { clone, fetch, checkout } from "../services/git";
import { selectBaseFolder, openFolder } from "../services/workspace";
import { parseParams, normalizeRepoUrl, repoToFolderName } from "../utils/url";
import { ensureDir, safeRelativePath } from "../utils/path";

export function createUriHandler(logger: Logger): vscode.UriHandler {
  return {
    handleUri: async (uri: vscode.Uri) => {
      try {
        logger.clear();
        logger.info(`[uri] ${uri.toString(true)}`);
        await handleBeeziUri(uri, logger);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        logger.error(msg);
        logger.show(true);
        vscode.window.showErrorMessage(`Beezi Open failed: ${msg}`);
      }
    }
  };
}

async function handleBeeziUri(uri: vscode.Uri, logger: Logger): Promise<void> {
  validateUri(uri);

  const params = parseParams(uri);
  if (!params.repo) throw new Error("Missing required param: repo");

  const originalRepo = params.repo;
  params.repo = normalizeRepoUrl(params.repo);

  logger.info(`[repo] raw: ${originalRepo}`);
  logger.info(`[repo] normalized: ${params.repo}`);
  logger.info(`[branch] ${params.branch ?? ""}`);
  logger.info(`[folder] ${params.folderName ?? ""}`);
  logger.info(`[path] ${params.openPath ?? ""}`);

  const defaultBase = getBaseFolder();
  const baseFolder = shouldAlwaysAsk() ? await selectBaseFolder(defaultBase) : defaultBase;

  await ensureDir(baseFolder);

  const folderName = params.folderName?.trim() || repoToFolderName(params.repo);
  const repoFolder = path.join(baseFolder, folderName);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Beezi: Opening repository...",
      cancellable: false
    },
    async (progress) => {
      if (!fs.existsSync(repoFolder) || !fs.existsSync(path.join(repoFolder, ".git"))) {
        progress.report({ message: `Cloning into ${repoFolder}...` });
        logger.info(`[git] clone -> ${repoFolder}`);
        await clone(params.repo, params.branch, repoFolder, logger);
      } else {
        progress.report({ message: `Fetching updates in ${repoFolder}...` });
        logger.info(`[git] fetch -> ${repoFolder}`);
        await fetch(repoFolder, logger);
      }

      if (params.branch?.trim()) {
        progress.report({ message: `Checking out ${params.branch}...` });
        logger.info(`[git] checkout -> ${params.branch.trim()}`);
        await checkout(repoFolder, params.branch.trim(), logger);
      }

      const openTarget = params.openPath
        ? path.join(repoFolder, safeRelativePath(params.openPath))
        : repoFolder;

      progress.report({ message: `Opening ${openTarget}...` });
      logger.info(`[open] ${openTarget}`);

      if (!fs.existsSync(openTarget)) {
        throw new Error(`openPath does not exist: ${openTarget}`);
      }

      await openFolder(openTarget);
    }
  );
}

function validateUri(uri: vscode.Uri): void {
  if (uri.authority !== EXT_ID) {
    throw new Error(
      `Unknown authority: ${uri.authority}. Use vscode://${EXT_ID}${ROUTE_OPEN}?repo=...`
    );
  }

  if (uri.path !== ROUTE_OPEN) {
    throw new Error(`Unknown route: ${uri.path}. Supported route: ${ROUTE_OPEN}`);
  }
}
