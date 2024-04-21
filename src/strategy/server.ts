import { withResolvers } from '../tools/utils/withResolvers';
import { CommunicationStrategy, ServerCommunicationStrategyOptions } from '../types/strategy/common.types';
import { Socket, createServer } from 'net';

export const createServerCommunicationStrategy = async({ port = 9001, hostname = '127.0.0.1' }: ServerCommunicationStrategyOptions): Promise<CommunicationStrategy> => {
  if (typeof port !== 'number') {
    throw Error('No port is specified.');
  }
  if (typeof hostname !== 'string') {
    throw Error('No hostname is specified.');
  }

  let socketInitialized = false;
  let socketResolvers = withResolvers<Socket>();
  let requestInitialized = false;
  let requestResolvers = withResolvers<string>();
  return new Promise((resolve) => {
    const server = createServer();
    server.on('connection', (socket) => {
      socketInitialized = true;
      socketResolvers.resolve(socket);
      socket.on('data', (request: Buffer) => {
        requestInitialized = true;
        requestResolvers.resolve(String(request));
      });
      socket.on('close', () => {
        socketInitialized = false;
        requestInitialized = false;
        socketResolvers = withResolvers<Socket>();
        requestResolvers = withResolvers<string>();
      });
    });
    server.listen(port, hostname, () => {
      resolve({
        shouldSuspend: async(currentCommand: string): Promise<boolean> => {
          if (!requestInitialized) {
            return false;
          }

          return requestResolvers.promise.then((request) => {
            return currentCommand.toLowerCase() === request.toLowerCase();
          });
        },
        complete: async(text?: string): Promise<void> => {
          if (!socketInitialized) {
            return Promise.resolve();
          }

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
          if (!requestInitialized) {
            return Promise.resolve('');
          }

          return requestResolvers.promise.then((request) => {
            requestResolvers = withResolvers<string>();
            return request;
          });
        },
        close: async(): Promise<void> => {
          if (!socketInitialized) {
            return new Promise((resolve) => {
              server.close(() => {
                resolve();
              });
            });
          }

          return socketResolvers.promise.then(async(socket) => {
            return new Promise((resolve) => {
              socket.end(() => {
                socket.destroy();
                server.close(() => {
                  resolve();
                });
              });
            });
          });
        },
      });
    });
  });
};
