import * as vscode from "vscode";
import { createLogger, type Logger } from "./services/logger";
import { createUriHandler } from "./handlers/uri-handler";

let logger: Logger | undefined;

export function activate(context: vscode.ExtensionContext): void {
  logger = createLogger("Beezi Open");
  const uriHandler = createUriHandler(logger);

  context.subscriptions.push({ dispose: () => logger?.dispose() });
  context.subscriptions.push(vscode.window.registerUriHandler(uriHandler));
}

export function deactivate(): void {
  logger?.dispose();
  logger = undefined;
}
