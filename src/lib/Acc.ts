import * as vscode from 'vscode';
import * as path from 'path';
import ahkEval from './ahkEval';
import { fileExists } from '../util';

interface Location {
  x: number;
  y: number;
}

export const getAccPath = async(): Promise<string | null> => {
  let accPath: string | null | undefined = null;
  return new Promise((resolve) => {
    if (!accPath) {
      const config = vscode.workspace.getConfiguration('operate-from-autohotkey');
      accPath = config.get('externalLibrary.acc');
    }
    resolve(accPath ?? null);
  });
};

export const getCaretCoordinates = async(): Promise<Location | null> => {
  const accPath = await getAccPath() ?? '';
  if (!await fileExists(accPath)) {
    throw Error(`\`Acc.ahk\` cannot be found. ${accPath ? ` Specified: \`${accPath}\`` : `Set up \`operate-from-autohotkey.externalLibrary.acc\``}`);
  }

  const ahkCode = `
    #Include ${path.resolve(accPath)}

    Acc_Caret := Acc_ObjectFromWindow(WinActive("A"), OBJID_CARET := 0xFFFFFFF8)
    Caret_Location := Acc_Location(Acc_Caret)
    FileOpen("*", "w", "utf-8").write("{ ""x"": " . Caret_Location.x . ", ""y"": " . Caret_Location.y . "}")
  `;

  const result = await ahkEval(ahkCode);
  if (result) {
    const caretLocation = JSON.parse(result) as Location;
    return caretLocation;
  }
  return null;
};
