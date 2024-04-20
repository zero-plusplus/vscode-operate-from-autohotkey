import * as vscode from 'vscode';
import { CommunicationStrategy } from '../types/strategy/common.types';
import { Socket, createServer } from 'net';

export const createServerCommunicationStrategy = async({ port = 9001, hostname = '127.0.0.1' }: Record<string, any>): Promise<CommunicationStrategy> => {
  if (typeof port !== 'number') {
    throw Error('No port is specified.');
  }
  if (typeof hostname !== 'string') {
    throw Error('No hostname is specified.');
  }

  let requests: string[];
  let socket: Socket;
  return new Promise((resolve) => {
    createServer((_socket) => {
      socket = _socket;
      socket.on('data', (request: Buffer) => {
        requests.push(String(request));
      });
    }).listen(port, hostname, () => {
      resolve({
        shouldSuspend: async(currentCommand: string): Promise<boolean> => {
          socket.once('data', (text: Buffer) => {
            return currentCommand.toLowerCase() === String(text).toLowerCase();
          });
          const text = await vscode.env.clipboard.readText();
          return currentCommand.toLowerCase() === text.toLowerCase();
        },
        complete: async(text?: string): Promise<void> => {
          return new Promise((resolve, rejects) => {
            socket.write(`${text ?? ''}\0`, (err) => {
              if (err) {
                rejects(err);
                return;
              }
              resolve();
            });
          });
        },
        receiveRequest: async(): Promise<string> => {
          return Promise.resolve(requests.shift() ?? '');
        },
        close: async(): Promise<void> => {
          return new Promise((resolve) => {
            socket.end(() => {
              socket.destroy();
              resolve();
            });
          });
        },
      });
    });
  });
};
