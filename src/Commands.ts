import * as vscode from 'vscode';
import { range } from 'underscore';
import { flatten } from 'objnest';
import { getCaretCoordinates } from './lib/acc';
import { ContextMonitor } from './lib/ContextMonitor';
import * as AsyncLock from 'async-lock';
const asyncLock = new AsyncLock();
const contextMonitor = new ContextMonitor().start();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getContexts = async() => {
  return {
    caret: {
      position: {
        line: contextMonitor.caret.line,
        column: contextMonitor.caret.column,
      },
      coordinates: await getCaretCoordinates(),
    },
    selections: contextMonitor.selections,
    selection: contextMonitor.selections[0],
    file: {
      path: contextMonitor.fileInfo.path,
      length: contextMonitor.fileInfo.length,
      eol: contextMonitor.fileInfo.eol,
    },
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const parseCommandText = (commandText: string) => {
  const match = commandText.match(/^(?<name>[\w.-]+)(?::(?<repeatCount>.+))?$/u);
  if (!match?.groups) {
    return null;
  }

  const repeatCount = parseInt(match.groups.repeatCount, 10);
  if (isNaN(repeatCount)) {
    return {
      name: commandText,
      repeatCount: 1,
    };
  }
  return {
    name: match.groups.name,
    repeatCount,
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
    return asyncLock.acquire('operate-from-autohotkey.executeCommand', async() => {
      try {
        const commandNames = await vscode.env.clipboard.readText();

        for await (const commandName of commandNames.split(',')) {
          const parsedCommand = parseCommandText(commandName.trim());
          if (!parsedCommand) {
            continue;
          }

          // Do not execute commands that are not allowed
          if (!isAllowedCommand(parsedCommand.name)) {
            throw Error(`'${parsedCommand.name}' is not allowed command. Abort the commands.`);
          }

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for await (const _ of range(parsedCommand.repeatCount)) {
            await vscode.commands.executeCommand(parsedCommand.name);

            // Exit immediately if there are any changes to the clipboard.
            if (parsedCommand.name.startsWith('operate-from-autohotkey.copy')) {
              return;
            }
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
          await vscode.env.clipboard.writeText('');
          throw error;
        }
      }

      await vscode.env.clipboard.writeText('');
    });
  },
  async 'operate-from-autohotkey.copy.context.caret'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.line}:${contextMonitor.caret.column}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.line'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.line}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.column'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.caret.column}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(`${coordinates.x},${coordinates.y}`);
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates.x'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(String(coordinates.x));
  },
  async 'operate-from-autohotkey.copy.context.caret.coordinates.y'(): Promise<void> {
    const coordinates = await getCaretCoordinates();
    await vscode.env.clipboard.writeText(String(coordinates.y));
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
  async 'operate-from-autohotkey.copy.context.selection'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.start.line}:${contextMonitor.selection.start.column}:${contextMonitor.selection.end.line}:${contextMonitor.selection.end.column}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.start'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.start.line}:${contextMonitor.selection.start.column}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.start.line'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.start.line}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.start.column'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.start.column}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.end'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.end.line}:${contextMonitor.selection.end.column}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.end.line'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.end.line}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.end.column'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.end.column}`);
  },
  async 'operate-from-autohotkey.copy.context.selection.text'(): Promise<void> {
    await vscode.env.clipboard.writeText(`${contextMonitor.selection.text}`);
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
