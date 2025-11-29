module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['src', 'node_modules'],
      },
    },
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  globals: {
    describe: true,
    after: true,
    afterEach: true,
    before: true,
    context: true,
    it: true,
    expect: true,
    $: true,
    $$: true,
    browser: true,
    run: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
    'no-continue': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'import/extensions': 'off',
    'no-case-declarations': 'off',
    'implicit-arrow-line-break': 'off',
    'max-len': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
