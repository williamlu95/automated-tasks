import csv from 'csvtojson';
import * as fs from 'fs';
import * as path from 'path';
import { DateTime } from 'luxon';
import { SOFI_TRANSACTION_HEADERS } from '../constants/transaction';
import { downloadDir } from '../utils/file';
import Page from './page';
import SofiLoginPage from './sofi-login-page';
import { Transaction } from '../types/transaction';
import { formatToDollars } from '../utils/currency-formatter';

const { JOINT_SOFI = '' } = process.env;

export type SofiTransaction = {
  Date: string;
  Description: string;
  Type: string;
  Amount: string;
  Balance: string;
  Status: string;
};

class SofiExportTransactionPage extends Page {
  private static FILE_PREFIX = 'SOFI-JointChecking';

  private static PERMANENT_FILE_LOCATION = './sofi-transactions.csv';

  get exportTransactionButtons() {
    return $$('button[aria-haspopup="listbox"]');
  }

  get options() {
    return $$('li[role="option"]');
  }

  get exportToCsv() {
    return $('button[aria-label="Export to CSV"]');
  }

  get fromDate() {
    return $('input[value]');
  }

  get toDate() {
    return $(`input[value="${DateTime.now().toFormat('MM/dd/yyyy')}"]`);
  }

  get exportButton() {
    return $(
      'button[data-mjs-value="view_name=banking_overview|app=banking_accounts_ui|platform=web|source_product=money|feature=overview|version=1.0|type=tap|element=button|element_name=transaction_module_export"]',
    );
  }

  private async getTransactionFile() {
    await browser.waitUntil(() => {
      const files = fs.readdirSync(`${downloadDir}/`);
      return files.some((f) => f.startsWith(SofiExportTransactionPage.FILE_PREFIX));
    });

    const files = fs.readdirSync(`${downloadDir}/`);
    return (
      files.find((f) => f.startsWith(SofiExportTransactionPage.FILE_PREFIX))
      ?? ''
    );
  }

  private async cleanFiles() {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
      return;
    }

    const files = fs.readdirSync(`${downloadDir}/`);
    files.forEach((file) => {
      fs.rmSync(path.join(downloadDir, file));
    });
  }

  async downloadTransactions() {
    await SofiLoginPage.login();
    await this.open();
    await browser.pause(5000);
    await browser.waitUntil(
      () => this.exportButton && this.exportButton.isClickable(),
    );
    await this.exportButton.click();
    await browser.waitUntil(
      async () => (await this.exportTransactionButtons.length) > 0,
    );

    const exportTransactionButtons = await this.exportTransactionButtons;
    const accountTransactionButton = exportTransactionButtons[0];
    const dateRangeButtons = exportTransactionButtons[1];
    await browser.waitUntil(
      async () => (await this.exportTransactionButtons.length) > 0,
    );

    await accountTransactionButton.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    const accountOptions = await this.options;
    const option = await this.getElementFromList(
      accountOptions,
      `Joint Checking • ${JOINT_SOFI}`,
    );
    await this.waitAndClick(option);

    await dateRangeButtons.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    const dateRangeOptions = await this.options;
    const dateRangeOption = await this.getElementFromList(
      dateRangeOptions,
      'Last 90 days',
    );

    await dateRangeOption.click();
    await browser.waitUntil(
      () => this.exportToCsv && this.exportToCsv.isClickable(),
    );

    await this.cleanFiles();
    await this.exportToCsv.click();
    const transactionFile = await this.getTransactionFile();
    const transactionPath = path.join(downloadDir, transactionFile);
    fs.copyFileSync(
      transactionPath,
      SofiExportTransactionPage.PERMANENT_FILE_LOCATION,
    );
  }

  private async getPreviouslyDownloadedTransactions(): Promise<
    SofiTransaction[]
    > {
    try {
      const transactions: SofiTransaction[] = await csv({
        headers: SOFI_TRANSACTION_HEADERS,
      }).fromFile(SofiExportTransactionPage.PERMANENT_FILE_LOCATION);

      if (transactions.length === 0) {
        throw Error(
          "Transactions are empty, shouldn't happen unless no money was spent for 2 months",
        );
      }
      return transactions;
    } catch (err) {
      console.error('Could not read from permanent file', err);
      throw Error('Could not read Sofi Transactions ending script early');
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    const transactions = await this.getPreviouslyDownloadedTransactions();
    return transactions.map((t) => ({
      date: t.Date,
      account: JOINT_SOFI,
      description: t.Description,
      amount: t.Amount,
    }));
  }

  async getBalance(): Promise<Record<string, string>> {
    const transactions = await this.getPreviouslyDownloadedTransactions();

    return { [JOINT_SOFI]: formatToDollars(transactions[0].Balance) };
  }

  open() {
    return super.open(
      'https://www.sofi.com/my/money/account/more/export-transaction-history',
    );
  }
}

export default new SofiExportTransactionPage();
