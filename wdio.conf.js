require('dotenv').config();

const {
  LOG_LEVEL,
} = process.env;

exports.config = {
  specs: [
    './test/specs/**/*.js',
  ],
  exclude: [
  ],
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
  waitforTimeout: 240000,
  connectionRetryTimeout: 240000,
  connectionRetryCount: 3,
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 240000,
  },
  before: () => {
    browser.setWindowSize(1280, 800);
  },
};
