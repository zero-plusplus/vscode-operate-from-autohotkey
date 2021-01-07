import * as vscode from 'vscode';

interface CaretPosition {
  line: number;
  column: number;
}
interface Selection {
  index: number;
  startOffset: number;
  start: CaretPosition;
  end: CaretPosition;
  text: string;
  length: number;
}
interface FileInfo {
  path: string;
  length: number;
  eol: '`n' | '`r`n';
}

const defaultCaret = { line: -1, column: -1 };
export class ContextMonitor {
  public fileInfo: FileInfo = { path: '', length: -1, eol: '`n' };
  public caret: CaretPosition = { ...defaultCaret };
  public selections: Selection[] = [];
  public selection: Selection = { index: 1, start: { ...defaultCaret }, end: { ...defaultCaret }, length: -1, startOffset: -1, text: '' };
  public start(): this {
    this.updateContexts(vscode.window.activeTextEditor);
    vscode.window.onDidChangeTextEditorSelection((event) => {
      this.updateContexts(event.textEditor);
    });

    return this;
  }
  private updateContexts(textEditor?: vscode.TextEditor): void {
    this.fileInfo.path = textEditor?.document.uri.fsPath ?? '';
    this.fileInfo.eol = textEditor?.document.eol === 1 ? '`n' : '`r`n';
    this.fileInfo.length = textEditor?.document.getText().length ?? -1;
    this.selections = textEditor?.selections.map((selection, i) => {
      const selectedText = textEditor.document.getText(selection);
      return {
        index: i + 1,
        start: {
          line: selection.start.line + 1,
          column: selection.start.character + 1,
        },
        end: {
          line: selection.end.line + 1,
          column: selection.end.character + 1,
        },
        startOffset: textEditor.document.getText(new vscode.Range(new vscode.Position(0, 0), selection.start)).length,
        text: selectedText,
        length: selectedText.length,
      };
    }) ?? [];
    this.selection = this.selections[0];
    this.caret = this.selection.start;
  }
}
