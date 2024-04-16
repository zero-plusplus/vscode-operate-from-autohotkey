import * as esbuild from 'esbuild';
import { now } from '../utils';

const watchCompletedMessage = '[esbuild] completed at';
export const startWatch = async(options: esbuild.BuildOptions): Promise<void> => {
  console.log(`${watchCompletedMessage} ${now()}`);
  const context = await esbuild.context({
    ...options,
    plugins: [
      {
        name: 'watch',
        setup(build): void {
          build.onEnd((result) => {
            if (0 < result.errors.length) {
              console.log(`${result.errors.map((error) => error.text).join('\n')}\n`);
            }
            console.log(`${watchCompletedMessage} ${now()}`);
          });
        },
      },
    ],
  });
  return context.watch();
};
