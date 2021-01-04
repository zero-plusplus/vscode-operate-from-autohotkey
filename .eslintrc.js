const { javascript, typescript } = require('@zero-plusplus/eslint-my-rules');

module.exports = {
  overrides: [
    {
      files: '*.js',
      env: {
        node: true,
        es6: true,
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      rules: { ...javascript.rules },
    },
    {
      files: '*.ts',
      env: {
        node: true,
        es6: true,
        mocha: true,
      },
      parser: typescript.parserName,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        tsconfigRootDir: './',
        project: [ './tsconfig.json' ],
      },
      plugins: [ typescript.pluginName ],
      rules: {
        ...typescript.rules,
        '@typescript-eslint/no-type-alias': 'off', // Not support template literal type
        'object-curly-newline': [ 'error', { multiline: true, consistent: true } ],
        'func-style': 'off', // This rule gets in the way when you want to define named functions in gulp
        'no-constant-condition': [ 'error', { 'checkLoops': false } ],
        'prefer-arrow-callback': 'off', // Frameworks like mocha force the use of function expressions
        '@typescript-eslint/no-unnecessary-condition': [ 'error', { allowConstantLoopConditions: true } ],
        '@typescript-eslint/no-invalid-void-type': 'off', // Can't use Promise<void[]> when using Promise.all
      },
    },
  ],
};
