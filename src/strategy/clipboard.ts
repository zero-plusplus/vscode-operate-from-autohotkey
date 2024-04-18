import * as vscode from 'vscode';
import { CommunicationStrategy } from '../types/strategy/common.types';

export const createClipboardCommunicationStrategy = (): CommunicationStrategy => {
  return {
    shouldSuspend: async(currentCommand: string): Promise<boolean> => {
      const text = await vscode.env.clipboard.readText();
      return currentCommand.toLowerCase() === text.toLowerCase();
    },
    complete: async(text?: string): Promise<void> => {
      await vscode.env.clipboard.writeText(text ?? '');
    },
    receiveRequest: async(): Promise<string> => {
      return vscode.env.clipboard.readText();
    },
  };
};
