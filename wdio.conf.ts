import * as dotenv from 'dotenv';
import { sendEmail } from './automation/utils/notification';
import { downloadDir, rmdir } from './automation/utils/file';
import { ErrorCounts } from './automation/utils/error-counts';

dotenv.config();

const { LOG_LEVEL } = process.env;

type WebdriverLogTypes = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';

export const config: WebdriverIO.Config = {
  specs: ['./automation/specs/**/*.e2e.ts'],
  suites: {
    daily: [
      './automation/specs/daily-tasks/run.e2e.ts',
    ],
    weekly: [
      './automation/specs/weekly-tasks/move-excess-to-pto.e2e.ts',
    ],
    monthly: [
      './automation/specs/monthly-tasks/pay-tmobile-bill.e2e.ts',
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
        args: process.env.HEADLESS === 'false' ? [] : ['headless', '--no-sandbox', 'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'],
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
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 1920000,
    retries: 5,
  },

  onComplete: async () => {
    rmdir(downloadDir);
    return null;
  },

  before: () => {
    browser.setWindowSize(1280, 800);
  },

  after: async (result, _capabilities, spec) => {
    if (result > 0) {
      await sendEmail({
        subject: 'ACTION REQUIRED: Automation Script Failure',
        html: `<h1><strong>Script Failed to Complete: </strong><span style="color: red;">${spec}</span></h1>`,
      });
    }

    ErrorCounts.updateCountsFile();
  },
};
