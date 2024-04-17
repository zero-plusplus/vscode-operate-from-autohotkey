import { Primitive } from 'type-fest';

export const deepFlatten = (obj: Record<string, any>, prevKey = ''): Record<string, Primitive> => {
  const separator = '.';

  return Object.keys(obj).reduce<Record<string, Primitive>>((flattened, key) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = obj[key];
    if (value === null) {
      return flattened;
    }

    const formattedKey = ((): string => {
      if (Array.isArray(obj)) {
        if (prevKey === '') {
          return `[${key}]`;
        }
        return `${prevKey}[${key}]`;
      }
      if (prevKey === '') {
        return key;
      }
      return `${prevKey}${separator}${key}`;
    })();

    switch (typeof value) {
      case 'undefined':
      case 'function': break;
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean': {
        flattened[formattedKey] = value;
        break;
      }
      case 'object': {
        Object.assign(flattened, deepFlatten(value as Record<string, any>, formattedKey));
        break;
      }
      default: break;
    }
    return flattened;
  }, {});
};
