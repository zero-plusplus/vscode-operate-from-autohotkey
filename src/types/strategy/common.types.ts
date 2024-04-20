export interface StrategyContext {
  hideError: boolean;
  repeatLimit: number;
  communicationStrategy: CommunicationStrategy;
}
export interface CommunicationStrategy {
  shouldSuspend: (currentCommand: string) => Promise<boolean>;
  complete: (text?: string) => Promise<void>;
  receiveRequest: () => Promise<string>;
  close: () => Promise<void>;
}

export const commandNameList = [
  'operate-from-autohotkey.executeCommand',
  'operate-from-autohotkey.copy.context.is.debugging',
  'operate-from-autohotkey.copy.context.caret',
  'operate-from-autohotkey.copy.context.caret.line',
  'operate-from-autohotkey.copy.context.caret.column',
  'operate-from-autohotkey.copy.context.caret.coordinates',
  'operate-from-autohotkey.copy.context.caret.coordinates.x',
  'operate-from-autohotkey.copy.context.caret.coordinates.y',
  'operate-from-autohotkey.copy.context.file',
  'operate-from-autohotkey.copy.context.file.path',
  'operate-from-autohotkey.copy.context.file.length',
  'operate-from-autohotkey.copy.context.file.eol',
  'operate-from-autohotkey.copy.context.selection',
  'operate-from-autohotkey.copy.context.selection.start',
  'operate-from-autohotkey.copy.context.selection.start.line',
  'operate-from-autohotkey.copy.context.selection.start.column',
  'operate-from-autohotkey.copy.context.selection.end',
  'operate-from-autohotkey.copy.context.selection.end.line',
  'operate-from-autohotkey.copy.context.selection.end.column',
  'operate-from-autohotkey.copy.context.selection.text',
  'operate-from-autohotkey.copy.context.json',
  'operate-from-autohotkey.copy.context.json.pretty',
  'operate-from-autohotkey.copy.context.flattenJson',
  'operate-from-autohotkey.copy.context.flattenJson.pretty',
] as const;
export type CommandName = typeof commandNameList[number];
export type Command = () => Promise<void>;
export type Commands = Record<typeof commandNameList[number], Command>;
