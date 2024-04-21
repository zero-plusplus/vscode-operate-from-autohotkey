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

export const sendCommandNameList = [
  'operate-from-autohotkey.get.context.is.debugging',
  'operate-from-autohotkey.get.context.caret',
  'operate-from-autohotkey.get.context.caret.line',
  'operate-from-autohotkey.get.context.caret.column',
  'operate-from-autohotkey.get.context.file',
  'operate-from-autohotkey.get.context.file.path',
  'operate-from-autohotkey.get.context.file.length',
  'operate-from-autohotkey.get.context.file.eol',
  'operate-from-autohotkey.get.context.selection',
  'operate-from-autohotkey.get.context.selection.start',
  'operate-from-autohotkey.get.context.selection.start.line',
  'operate-from-autohotkey.get.context.selection.start.column',
  'operate-from-autohotkey.get.context.selection.end',
  'operate-from-autohotkey.get.context.selection.end.line',
  'operate-from-autohotkey.get.context.selection.end.column',
  'operate-from-autohotkey.get.context.selection.text',
  'operate-from-autohotkey.get.context.json',
  'operate-from-autohotkey.get.context.json.pretty',
  'operate-from-autohotkey.get.context.flattenJson',
  'operate-from-autohotkey.get.context.flattenJson.pretty',

] as const;
export type SendCommandName = typeof sendCommandNameList[number];
export const commandNameList = [ ...sendCommandNameList, 'operate-from-autohotkey.executeCommand' ] as const;
export type CommandName = typeof commandNameList[number];
export type Command = () => Promise<void>;
export type Commands = Record<typeof commandNameList[number], Command>;
