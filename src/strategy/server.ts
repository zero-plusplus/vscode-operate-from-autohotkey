import { CommunicationStrategy } from '../types/strategy/common.types';
import { Socket, createServer } from 'net';

export const createServerCommunicationStrategy = async({ port = 9001, hostname = '127.0.0.1' }: Record<string, any>): Promise<CommunicationStrategy> => {
  if (typeof port !== 'number') {
    throw Error('No port is specified.');
  }
  if (typeof hostname !== 'string') {
    throw Error('No hostname is specified.');
  }

  const requests: string[] = [];
  const socketResolvers = (<T extends Socket>(): { resolve: (value: T) => void; reject: (err?: Error) => void; promise: Promise<T> } => {
    return Promise.withResolvers();
  })();
  let initialized = false;
  return new Promise((resolve) => {
    createServer((socket) => {
      initialized = true;
      socket.on('data', (request: Buffer) => {
        const request_str = String(request);
        requests.push(request_str);
      });
      socketResolvers.resolve(socket);
    }).listen(port, hostname, () => {
      resolve({
        shouldSuspend: async(currentCommand: string): Promise<boolean> => {
          if (0 < requests.length) {
            return Promise.resolve(currentCommand.toLowerCase() === requests[0].toLowerCase());
          }
          return false;
        },
        complete: async(text?: string): Promise<void> => {
          return socketResolvers.promise.then(async(socket) => {
            return new Promise((resolve, rejects) => {
              socket.write(`${text ?? ''}\0`, (err) => {
                if (err) {
                  rejects(err);
                  return;
                }
                resolve();
              });
            });
          });
        },
        receiveRequest: async(): Promise<string> => {
          return Promise.resolve(requests.shift() ?? '');
        },
        close: async(): Promise<void> => {
          if (!initialized) {
            return Promise.resolve();
          }

          return socketResolvers.promise.then(async(socket) => {
            return new Promise((resolve) => {
              socket.end(() => {
                socket.destroy();
                resolve();
              });
            });
          });
        },
      });
    });
  });
};
