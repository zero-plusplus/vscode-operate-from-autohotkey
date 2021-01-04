import { promises as fs } from 'fs';

export const fileExists = async(path: string): Promise<boolean> => {
  try {
    return (await fs.stat(path)).isFile();
  }
  catch (e: unknown) {
  }
  return false;
};
