import { promises as fs } from 'fs';
import * as gulp from 'gulp';
import * as webpack from 'webpack';
import run from 'gulp-run-command';
import { ESLint } from 'eslint';
import * as del from 'del';
import eslintrc from './.eslintrc';
import webpackProduction from './webpack.production';
import webpackDevelopment from './webpack.development';

const clean = async(): Promise<void> => {
  await del('./build');
};

// #region lint
const tscheck = async(): Promise<void> => {
  await run('tsc --noEmit')();
};
const eslint = async(): Promise<void> => {
  const tsconfig = JSON.parse(await fs.readFile('./tsconfig.json', 'utf-8'));
  const targetFiles = [ ...tsconfig.include!, '*.js' ];

  const eslint = new ESLint(eslintrc);
  const results = await eslint.lintFiles(targetFiles).catch((err) => {
    throw err;
  });
  await ESLint.outputFixes(results);
};
const lint = gulp.parallel(tscheck, eslint);
// #region lint

// #region build
const buildMain = async(): Promise<void> => {
  await run('tsc')();
};
const build = gulp.series(clean, buildMain);
// #endregion build

// #region bundle
const bundling = async(webpackConfig: webpack.Configuration): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const compiler = webpack({ ...webpackConfig });
    compiler.run((err, result) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      if (result) {
        if (result.hasErrors()) {
          reject(result.compilation.errors);
          return;
        }
        if (result.hasWarnings()) {
          reject(result.compilation.warnings);
        }
        console.log(result.toString());
      }
      resolve();
    });
  });
};
const bundleMain = async(): Promise<void> => {
  return bundling(webpackProduction);
};
const bundleMainDebug = async(): Promise<void> => {
  return bundling(webpackDevelopment);
};
const bundleWithoutClean = gulp.parallel(bundleMain);
const bundle = gulp.series(clean, bundleWithoutClean);
const bundleDebugWithoutClean = gulp.parallel(bundleMainDebug);
const bundleDebug = gulp.series(clean, bundleDebugWithoutClean);
// #endregion bundle

// #region watch
const watchMain = async(): Promise<void> => {
  return run('tsc -w')();
};
const watch = gulp.series(clean, build, watchMain);
// #endregion watch

const packaging = gulp.series(clean, run('vsce package --yarn'));
export {
  clean,
  lint,
  build,
  bundleWithoutClean,
  bundle,
  bundleDebugWithoutClean,
  bundleDebug,
  watch,
  packaging,
};
