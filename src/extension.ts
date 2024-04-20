import * as vscode from 'vscode';
import { registerCommands } from './strategy';

export const activate = async(context: vscode.ExtensionContext): Promise<void> => {
  context.subscriptions.push(await registerCommands());
};
