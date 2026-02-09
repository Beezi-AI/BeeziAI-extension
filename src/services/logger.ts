import * as vscode from "vscode";

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  clear: () => void;
  show: (preserveFocus?: boolean) => void;
  dispose: () => void;
};

export function createLogger(name: string): Logger {
  const channel = vscode.window.createOutputChannel(name);

  return {
    info: (message: string) => channel.appendLine(message),
    error: (message: string) => channel.appendLine(`[error] ${message}`),
    clear: () => channel.clear(),
    show: (preserveFocus = true) => channel.show(preserveFocus),
    dispose: () => channel.dispose()
  };
}
