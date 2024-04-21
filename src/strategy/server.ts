import { createMutex } from '../tools/utils/createMutex';
import { withResolvers } from '../tools/utils/withResolvers';
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
  const socketResolvers = withResolvers<Socket>();
  let requestResolvers = withResolvers<string>();
  let initialized = false;
  return new Promise((resolve) => {
    createServer((socket) => {
      initialized = true;
      socket.on('data', (request: Buffer) => {
        createMutex('request').use(async() => {
          requestResolvers.resolve(String(request));
          return Promise.resolve();
        });
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
          return requestResolvers.promise.then((request) => {
            requestResolvers = withResolvers<string>();
            return request;
          });
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
