export const withResolvers = <T>(): { resolve: (value: T) => void; reject: (err?: Error) => void; promise: Promise<T> } => {
  return Promise.withResolvers();
};
