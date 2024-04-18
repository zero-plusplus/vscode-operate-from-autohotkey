import { Mutex, Task } from '../../types/tools/utils/createMutex.types';

const cache = new Map<string, Mutex>();
export const createMutex = (key = ''): Mutex => {
  if (cache.has(key)) {
    return cache.get(key)!;
  }

  let currentTaskResult: Promise<any> = Promise.resolve();
  const mutex: Mutex = {
    use: async<T>(task: Task<T>): Promise<T> => {
      currentTaskResult = currentTaskResult.then(async() => {
        return task();
      });
      return currentTaskResult as Promise<T>;
    },
  };

  cache.set(key, mutex);
  return mutex;
};
