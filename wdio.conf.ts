import * as dotenv from 'dotenv';
import { sendEmail } from './automation/utils/notification';
import { downloadDir, rmdir } from './automation/utils/file';
import { TransactionCounts } from './automation/utils/transaction-counts';

dotenv.config();

const { LOG_LEVEL } = process.env;

type WebdriverLogTypes = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

const FAILED_ATTEMPTS_KEY = 'failedAttempts';
const FAILED_ATTEMPT_LIMIT = 3;

export const config: WebdriverIO.Config = {
  specs: ['./automation/specs/**/*.e2e.ts'],
  suites: {
    daily: ['./automation/specs/daily-tasks/**/*.e2e.ts'],
  },
  exclude: [],
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: './tsconfig.json',
      transpileOnly: true,
    },
  },
  maxInstances: 1,
  capabilities: [
    {
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
    },
  ],
  logLevel: LOG_LEVEL as WebdriverLogTypes,
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 240000,
  connectionRetryTimeout: 240000,
  connectionRetryCount: 3,
  services: ['chromedriver', 'shared-store'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 1920000,
    retries: 5,
  },

  onComplete: async (_exitCode, _config, _capabilities, results) => {
    rmdir(downloadDir);

    if (results.failed > 0) {
      TransactionCounts.addToTransactionCount(1, FAILED_ATTEMPTS_KEY);
    } else {
      TransactionCounts.setTransactionCount(0, FAILED_ATTEMPTS_KEY);
    }
    const failedAttempts = TransactionCounts.getTransactionCount(FAILED_ATTEMPTS_KEY);

    if (failedAttempts >= FAILED_ATTEMPT_LIMIT) {
      return sendEmail({
        subject: 'ACTION REQUIRED: Automation Script Failure',
        html: `<h1><strong>Failed Attempt Count: </strong><span style="color: red;">${failedAttempts}</span></h1>`,
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

  afterTest: async (_test, _context, result) => {
    if (result.error) {
      await browser.saveScreenshot(`../logs/error-${new Date().getHours()}.png`);
    }
  },
};
