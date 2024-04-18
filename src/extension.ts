import * as vscode from 'vscode';
import { registerCommands } from './strategy';

export const activate = (context: vscode.ExtensionContext): void => {
  registerCommands();
};
