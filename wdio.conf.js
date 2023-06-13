require('dotenv').config();
const path = require('path');
const fs = require('fs');
const getMonth = require('date-fns/getMonth');

const TRANSACTION_COUNT_FILE = './counts.json';
global.downloadDir = path.join(__dirname, 'tempDownload');

const {
  LOG_LEVEL,
} = process.env;

function rmdir(dir) {
  const list = fs.readdirSync(dir);
  for (let i = 0; i < list.length; i += 1) {
    const filename = path.join(dir, list[i]);
    const stat = fs.statSync(filename);

    if (filename === '.' || filename === '..') {
      continue;
    }

    if (stat.isDirectory()) {
      rmdir(filename);
      continue;
    }

    fs.unlinkSync(filename);
  }
  fs.rmdirSync(dir);
}

exports.config = {
  specs: [
    './automation/specs/**/*.e2e.js',
  ],
  exclude: [
  ],
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: process.env.HEADLESS === 'false' ? [] : ['--headless', '--disable-gpu', '--no-sandbox'],
      prefs: {
        directory_upgrade: true,
        prompt_for_download: false,
        'download.default_directory': downloadDir,
      },
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
  onPrepare() {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const currentMonth = getMonth(new Date()) + 1;
    const transactionCounts = JSON.parse(fs.readFileSync(TRANSACTION_COUNT_FILE));

    if (currentMonth !== transactionCounts.month) {
      Object.keys(transactionCounts).forEach((key) => {
        transactionCounts[key] = key === 'month' ? currentMonth : 0;
      });

      fs.writeFileSync(TRANSACTION_COUNT_FILE, JSON.stringify(transactionCounts, null, 4), 'utf8');
    }
  },
  onComplete() {
    rmdir(downloadDir);
  },
  before: () => {
    browser.setWindowSize(1280, 800);
  },
};
