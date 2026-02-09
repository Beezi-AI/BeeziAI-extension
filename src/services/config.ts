import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";

export function getBaseFolder(): string {
  const cfg = vscode.workspace.getConfiguration("beeziOpen");
  return cfg.get<string>("baseFolder")?.trim() || path.join(os.homedir(), "beezi-workspaces");
}

export function shouldAlwaysAsk(): boolean {
  const cfg = vscode.workspace.getConfiguration("beeziOpen");
  return cfg.get<boolean>("alwaysAskDestination", false);
}
