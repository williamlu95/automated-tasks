require('dotenv').config();
const { sendTextMessage } = require('./test/twilio/twilio');

const {
  LOG_LEVEL,
} = process.env;

exports.config = {
  specs: [
    './test/specs/**/*.js',
  ],
  exclude: [
  ],
  suites: {
    morning: [
      './test/specs/add-income-to-wallet.e2e.js',
    ],
    night: [
      './test/specs/add-credit-card-payments-to-wallet.e2e.js',
    ],
  },
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: process.env.NODE_ENV === 'mac' ? [] : ['--headless', '--disable-gpu', '--no-sandbox'],
    },
  }],
  // Level of logging verbosity: trace | debug | info | warn | error | silent
  logLevel: LOG_LEVEL,
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 60000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  before: () => {
    browser.setWindowSize(1280, 800);
  },
  onComplete(_exitCode, _config, _capabilities, results) {
    if (results.failed > 0) {
      sendTextMessage(`${results.failed} automated script${results.failed > 1 ? 's' : ''} failed to complete.`);
    }
  },
};
