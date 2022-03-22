const Twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const {
  PERSONAL_PHONE_NUMBER, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, LOG_LEVEL,
} = process.env;

const client = new Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

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
      client.messages
        .create({
          body: `${results.failed} automated script${results.failed > 1 ? 's' : ''} failed to complete.`,
          from: TWILIO_PHONE_NUMBER,
          to: PERSONAL_PHONE_NUMBER,
        })
        // eslint-disable-next-line no-console
        .then((message) => console.log(message.sid));
    }
  },
};
