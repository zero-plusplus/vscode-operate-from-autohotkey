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
  let socketResolvers = withResolvers<Socket>();
  let requestResolvers = withResolvers<string>();
  return new Promise((resolve) => {
    const server = createServer();
    server.on('connection', (socket) => {
      socketResolvers.resolve(socket);
      socket.on('data', (request: Buffer) => {
        requestResolvers.resolve(String(request));
      });
      socket.on('close', () => {
        socketResolvers = withResolvers<Socket>();
        requestResolvers = withResolvers<string>();
      });
    });
    server.listen(port, hostname, () => {
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
