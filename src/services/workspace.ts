import * as vscode from "vscode";

export async function selectBaseFolder(defaultBase: string): Promise<string> {
  const pick = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: "Select destination base folder"
  });

  return pick?.[0]?.fsPath ?? defaultBase;
}

export async function openFolder(folderPath: string): Promise<void> {
  await vscode.commands.executeCommand(
    "vscode.openFolder",
    vscode.Uri.file(folderPath),
    { forceNewWindow: false }
  );
}
