import * as vscode from 'vscode';
import { range } from 'underscore';
import { flatten } from 'objnest';
import { getAccPath, getCaretCoordinates } from './lib/acc';
import { ContextMonitor } from './lib/ContextMonitor';

const contextMonitor = new ContextMonitor().start();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getContexts = async() => {
  const contexts = {
    caret: {
      position: {
        line: contextMonitor.caret.line,
        column: contextMonitor.caret.column,
      },
      coordinates: {
        x: -1,
        y: -1,
      },
    },
    selections: contextMonitor.selections,
    selection: contextMonitor.selections[0],
    file: {
      path: contextMonitor.fileInfo.path,
      length: contextMonitor.fileInfo.length,
      eol: contextMonitor.fileInfo.eol,
    },
  };

  try {
    if (await getAccPath()) {
      const coordinates = await getCaretCoordinates();
      if (coordinates) {
        contexts.caret.coordinates = {
          x: coordinates.x,
          y: coordinates.y,
        };
      }
    }
  }
  catch (error: unknown) {
  }

  return contexts;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const parseCommandText = (text: string) => {
  const match = text.match(/^(?<name>[\w.-]+)(?::(?<repeatCount>\d+))?(?:\s(?<params>.+))?$/u);
  if (!match?.groups) {
    return null;
  }

  const { name, params } = match.groups;
  let repeatCount = 1;
  if (!isNaN(parseInt(match.groups.repeatCount, 10))) {
    repeatCount = parseInt(match.groups.repeatCount, 10);
  }

  return {
    name,
    repeatCount,
    params,
  };
};

const isAllowedCommand = (commandName: string): boolean => {
  if (commandName.toLowerCase() === 'operate-from-autohotkey.executecommand') {
    return false;
  }

  const allowCommands = vscode.workspace.getConfiguration('operate-from-autohotkey').get('allowCommands') as string[];
  for (const allowCommand of allowCommands) {
    if (allowCommand === '*') {
      return true;
    }

    if (allowCommand.endsWith('*')) {
      const allowCommandWithoutAsterisk = allowCommand.slice(0, -1).toLowerCase();
      if (commandName.toLowerCase().startsWith(allowCommandWithoutAsterisk)) {
        return true;
      }
      else if (commandName.toLowerCase() === allowCommand.toLowerCase()) {
        return true;
      }
    }
  }
  return false;
};

export const Commands = {
  async 'operate-from-autohotkey.executeCommand'(): Promise<void> {
    try {
      const commandNames = await vscode.env.clipboard.readText();
      if (commandNames === '') {
        return;
      }

      for await (const commandName of commandNames.split(',')) {
        const parsedCommand = parseCommandText(commandName.trim());
        if (!parsedCommand) {
          continue;
        }

        // Do not execute commands that are not allowed
        if (!isAllowedCommand(parsedCommand.name)) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of range(parsedCommand.repeatCount)) {
          await vscode.commands.executeCommand(parsedCommand.name);

          // Exit immediately if there are any changes to the clipboard.
          const currentClip = await vscode.env.clipboard.readText();
          if (commandNames !== currentClip) {
            return;
          }
        }
      }
    }
    catch (error: unknown) {
      const hideError = Boolean(vscode.workspace.getConfiguration('operate-from-autohotkey').get('hideError'));
      if (!hideError) {
        throw error;
      }
    }
    finally {
      await vscode.env.clipboard.writeText('');
    }
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(coordinates ? `${coordinates.x},${coordinates.y}` : `-1,-1`);
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates.x'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(String(coordinates?.x ?? -1));
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates.y'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(String(coordinates?.y ?? -1));
  },
  async 'operate-from-autohotkey.copy.context.caret.position'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.line}:${contextMonitor.caret.column}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.position.line'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.line}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.position.column'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.column}`);
  },
  async 'operate-from-autohotkey.copy.context.file'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.fileInfo.path}:${contextMonitor.caret.line}:${contextMonitor.caret.column}`);
  },
  async 'operate-from-autohotkey.copy.context.file.path'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.fileInfo.path}`);
  },
  async 'operate-from-autohotkey.copy.context.file.length'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.fileInfo.length}`);
  },
  async 'operate-from-autohotkey.copy.context.file.eol'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.fileInfo.eol}`);
  },
  async 'operate-from-autohotkey.copy.context.json'(): Promise<void> {
    const text = JSON.stringify(await getContexts());
    await vscode.env.clipboard.writeText(text);
  },
  async 'operate-from-autohotkey.copy.context.json.pretty'(): Promise<void> {
    const text = JSON.stringify(await getContexts(), null, 4);
    await vscode.env.clipboard.writeText(text);
  },
  async 'operate-from-autohotkey.copy.context.flattenJson'(): Promise<void> {
    const text = JSON.stringify(flatten(await getContexts()));
    await vscode.env.clipboard.writeText(text);
  },
  async 'operate-from-autohotkey.copy.context.flattenJson.pretty'(): Promise<void> {
    const text = JSON.stringify(flatten(await getContexts()), null, 4);
    await vscode.env.clipboard.writeText(text);
  },
};
