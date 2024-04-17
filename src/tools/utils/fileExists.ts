import { statSync } from 'fs';

export const fileExists = (filePath: string): boolean => {
  try {
    return statSync(filePath).isFile();
  }
  catch {
  }
  return false;
};
