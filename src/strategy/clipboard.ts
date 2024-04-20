import * as vscode from 'vscode';
import { CommunicationStrategy } from '../types/strategy/common.types';

export const createClipboardCommunicationStrategy = async(): Promise<CommunicationStrategy> => {
  const strategy: CommunicationStrategy = {
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
    close: async(): Promise<void> => {
      return Promise.resolve();
    },
  };
  return Promise.resolve(strategy);
};
