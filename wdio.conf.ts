import * as dotenv from 'dotenv';
import { sendEmail } from './automation/utils/notification';
import { downloadDir, rmdir } from './automation/utils/file';
import { TransactionCounts } from './automation/utils/transaction-counts';

dotenv.config();

const {
  LOG_LEVEL,
} = process.env;

type WebdriverLogTypes = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'

export const config: WebdriverIO.Config = {
  specs: [
    './automation/specs/**/*.e2e.ts',
  ],
  exclude: [
  ],
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true,
    },
  },
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true,
    'goog:chromeOptions': {
      args: process.env.HEADLESS === 'false' ? [] : ['--headless', '--no-sandbox'],
      prefs: {
        directory_upgrade: true,
        prompt_for_download: false,
        'download.default_directory': downloadDir,
      },
    },
  }],
  logLevel: LOG_LEVEL as WebdriverLogTypes,
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
    timeout: 480000,
  },

  onComplete: async (_exitCode, _config, _capabilities, results) => {
    rmdir(downloadDir);

    if (results.failed > 0) {
      return sendEmail({
        subject: 'Automation Script Failed',
        text: `${results.failed} automated script${results.failed === 1 ? 's' : ''} failed to complete.`,
      });
    }

    return null;
  },

  before: () => {
    browser.setWindowSize(1280, 800);
  },

  after: () => {
    TransactionCounts.updateCountsFile();
  },
};
