import * as vscode from 'vscode';
import * as path from 'path';
import ahkEval from './ahkEval';
import { fileExists } from '../util';

interface Coordinates {
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

export const getCaretCoordinates = async(): Promise<Coordinates> => {
  const accPath = await getAccPath() ?? '';
  if (!await fileExists(accPath)) {
    return { x: -1, y: -1 };
  }

  const ahkCode = `
    #NoTrayIcon
    #SingleInstance
    #Include ${path.resolve(accPath)}

    ; https://www.autohotkey.com/boards/viewtopic.php?f=60&t=77464&sid=f08c842bb0abce7b31e7f4b7aa0dd6ad&start=20#post_content364628
    Acc_Caret := Acc_ObjectFromWindow(WinActive("A"), OBJID_CARET := 0xFFFFFFF8)
    Caret_Location := Acc_Location(Acc_Caret)

    FileOpen("*", "w", "utf-8").write("{ ""x"": " . Caret_Location.x . ", ""y"": " . Caret_Location.y . "}")
  `;

  const result = await ahkEval(ahkCode);
  if (result) {
    const caretCoordinates = JSON.parse(result) as Coordinates;
    return caretCoordinates;
  }
  return { x: -1, y: -1 };
};
