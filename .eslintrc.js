module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
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
    downloadDir: true,
    transactionCounts: true,
    emailSender: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'class-methods-use-this': 'off',
    'import/prefer-default-export': 'off',
    'no-continue': 'off',
  },
};
