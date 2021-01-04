import * as vscode from 'vscode';
import { Commands } from './Commands';

export const activate = (context: vscode.ExtensionContext): void => {
  for (const [ commandName, command ] of Object.entries(Commands)) {
    vscode.commands.registerCommand(commandName, command);
  }
};
