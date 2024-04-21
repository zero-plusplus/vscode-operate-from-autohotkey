import * as vscode from 'vscode';
import { deepFlatten } from '../tools/utils/deepFlatten';
import { Commands, SendCommandName, StrategyContext, sendCommandNameList } from '../types/strategy/common.types';
import { createMutex } from '../tools/utils/createMutex';
import { ContextMonitor } from '../tools/ContextMonitor';
import { createClipboardCommunicationStrategy } from './clipboard';
import { range } from '../tools/utils/range';
import { configRootName } from '../constant';
import { clamp } from '../tools/utils/clamp';
import { createServerCommunicationStrategy } from './server';

const contextMonitor = new ContextMonitor().start();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getContexts = () => {
  return {
    caret: contextMonitor.caret,
    selections: contextMonitor.selections,
    selection: contextMonitor.selections[0],
    file: { ...contextMonitor.fileInfo },
    is: { ...contextMonitor.is },
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

  const allowCommands = vscode.workspace.getConfiguration('operate-from-autohotkey').get<string[]>('allowCommands')!;
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

export const registerCommands = async(): Promise<vscode.Disposable> => {
  const context = {
    hideError: false,
    repeatLimit: 1000,
    communicationStrategy: await createClipboardCommunicationStrategy(),
  };

  await updateCommunicationStrategy();
  vscode.workspace.onDidChangeConfiguration(async(e) => {
    await updateCommunicationStrategy(e);
  });

  for (const [ commandName, command ] of Object.entries(createCommands(context))) {
    vscode.commands.registerCommand(commandName, command);
  }

  return {
    dispose: async(): Promise<void> => {
      return context.communicationStrategy.close();
    },
  };

  async function updateCommunicationStrategy(event?: vscode.ConfigurationChangeEvent): Promise<void> {
    return createMutex('updateCommunicationStrategy').use(async(): Promise<void> => {
      const conf = vscode.workspace.getConfiguration(configRootName);
      if (!event || event.affectsConfiguration(`${configRootName}.communicationStrategy`)) {
        const strategyName = conf.get<string>('communicationStrategy', 'clipboard').toString();
        switch (strategyName) {
        // eslint-disable-next-line require-atomic-updates
          case 'clipboard': context.communicationStrategy = await createClipboardCommunicationStrategy(); break;
            // eslint-disable-next-line require-atomic-updates
          case 'server': context.communicationStrategy = await createServerCommunicationStrategy({ port: 9001 }); break;
          default: break;
        }
      }
      if (!event || event.affectsConfiguration(`${configRootName}.hideError`)) {
      // eslint-disable-next-line require-atomic-updates
        context.hideError = conf.get<boolean>('hideError', true);
      }
      if (!event || event.affectsConfiguration(`${configRootName}.repeatLimit`)) {
      // eslint-disable-next-line require-atomic-updates
        context.repeatLimit = conf.get<number>('repeatLimit', 100);
      }
    });
  }
  function createCommands(context: StrategyContext): Commands {
    const commands: Commands = {
      async 'operate-from-autohotkey.executeCommand'(): Promise<void> {
        return createMutex('operate-from-autohotkey.executeCommand').use(async() => {
          try {
            const requestCommandNames = await context.communicationStrategy.receiveRequest();

            for await (const commandName of requestCommandNames.split(',')) {
              const parsedCommand = parseCommandText(commandName.trim());
              if (!parsedCommand) {
                continue;
              }

              // Do not execute commands that are not allowed
              if (!isAllowedCommand(parsedCommand.name)) {
                throw Error(`'${parsedCommand.name}' is not allowed command. Abort the commands.`);
              }

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              for await (const _ of range(clamp(parsedCommand.repeatCount, 1, context.repeatLimit))) {
                // This command itself is not processed.
                if (parsedCommand.name.toLowerCase() === 'operate-from-autohotkey.executeCommand') {
                  continue;
                }

                if (sendCommandNameList.includes(parsedCommand.name as SendCommandName)) {
                  await commands[parsedCommand.name as SendCommandName]();
                  return;
                }

                await vscode.commands.executeCommand(parsedCommand.name);
              }
            }
          }
          catch (error: unknown) {
            if (!context.hideError) {
              throw error;
            }
          }

          await context.communicationStrategy.complete();
        });
      },
      async 'operate-from-autohotkey.get.context.is.debugging'(): Promise<void> {
        const text = `${Number(contextMonitor.is.debugging)}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.caret'(): Promise<void> {
        const text = `${contextMonitor.caret.line}:${contextMonitor.caret.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.caret.line'(): Promise<void> {
        const text = `${contextMonitor.caret.line}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.caret.column'(): Promise<void> {
        const text = `${contextMonitor.caret.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.file'(): Promise<void> {
        const text = `${contextMonitor.fileInfo.path}:${contextMonitor.caret.line}:${contextMonitor.caret.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.file.path'(): Promise<void> {
        const text = `${contextMonitor.fileInfo.path}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.file.length'(): Promise<void> {
        const text = `${contextMonitor.fileInfo.length}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.file.eol'(): Promise<void> {
        const text = `${contextMonitor.fileInfo.eol}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection'(): Promise<void> {
        const text = `${contextMonitor.selection.start.line}:${contextMonitor.selection.start.column}:${contextMonitor.selection.end.line}:${contextMonitor.selection.end.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.start'(): Promise<void> {
        const text = `${contextMonitor.selection.start.line}:${contextMonitor.selection.start.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.start.line'(): Promise<void> {
        const text = `${contextMonitor.selection.start.line}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.start.column'(): Promise<void> {
        const text = `${contextMonitor.selection.start.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.end'(): Promise<void> {
        const text = `${contextMonitor.selection.end.line}:${contextMonitor.selection.end.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.end.line'(): Promise<void> {
        const text = `${contextMonitor.selection.end.line}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.end.column'(): Promise<void> {
        const text = `${contextMonitor.selection.end.column}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.selection.text'(): Promise<void> {
        const text = `${contextMonitor.selection.text}`;
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.json'(): Promise<void> {
        const text = JSON.stringify(getContexts());
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.json.pretty'(): Promise<void> {
        const text = JSON.stringify(getContexts(), null, 4);
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.flattenJson'(): Promise<void> {
        const text = JSON.stringify(deepFlatten(getContexts()));
        await context.communicationStrategy.complete(text);
      },
      async 'operate-from-autohotkey.get.context.flattenJson.pretty'(): Promise<void> {
        const text = JSON.stringify(deepFlatten(getContexts()), null, 4);
        await context.communicationStrategy.complete(text);
      },

    };
    return commands;
  }
};
