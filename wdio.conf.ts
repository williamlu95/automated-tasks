import * as dotenv from 'dotenv';
import { sendEmail } from './automation/utils/notification';
import { downloadDir, rmdir } from './automation/utils/file';
import { ErrorCounts } from './automation/utils/error-counts';

dotenv.config();

const { LOG_LEVEL } = process.env;

type WebdriverLogTypes = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

const FAILED_ATTEMPT_LIMIT = 3;

export const config: WebdriverIO.Config = {
  specs: ['./automation/specs/**/*.e2e.ts'],
  suites: {
    daily: [
      './automation/specs/daily-tasks/personal/personal-daily-tasks.e2e.ts',
      './automation/specs/daily-tasks/joint/joint-daily-tasks.e2e.ts',
      './automation/specs/daily-tasks/mother/mother-daily-tasks.e2e.ts',
    ],
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
      ErrorCounts.addToFailedCount(1);
    } else {
      ErrorCounts.setFailedCount(0);
    }
    const failedAttempts = ErrorCounts.getFailedCount();

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
    ErrorCounts.updateCountsFile();
  },

  afterTest: async (_test, _context, result) => {
    if (result.error) {
      await browser.saveScreenshot(`../logs/error-${new Date().getHours()}.png`);
    }
  },
};
