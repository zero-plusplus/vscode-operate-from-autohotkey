import * as path from 'path';
import { spawn } from 'child_process';
import { fileExists } from '../util';

const defaultRuntimePath = path.resolve(String(process.env.PROGRAMFILES), 'AutoHotkey', 'AutoHotkey.exe');

/**
 * @return A string output to stdout. If it is not output, it is null. The same applies if the timeout has expired.
 */
export default async(ahkCode: string, runtime?: string, timeout_ms = 500): Promise<string | null> => {
  const runtimePath = path.resolve(runtime ?? defaultRuntimePath);
  if (!await fileExists(runtimePath)) {
    throw Error(`AutoHotkey not installed. Specified: \`${runtimePath}\``);
  }

  return Promise.race<string | null>([
    new Promise<string | null>((resolve, reject) => {
      const child = spawn(runtimePath, [ '/CP65001', '/ErrorStdOut', '*' ]);
      child.stdout.on('data', (buffer) => {
        const outputString = Buffer.from(buffer).toString('utf-8');
        if (outputString) {
          resolve(outputString);
          return;
        }
        resolve(null);
      });
      child.stdin.end(ahkCode);
    }),
    // Timeout
    new Promise<string | null>((resolve) => {
      setTimeout((): void => {
        resolve(null);
      }, timeout_ms);
    }),
  ]);
};
