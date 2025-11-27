import * as csv from 'csvtojson';
import * as fs from 'fs';
import * as path from 'path';
import Page from './page';
import { downloadDir } from '../utils/file';
import { EMPOWER_TRANSACTION_HEADERS } from '../constants/transaction';
import EmpowerLoginPage from './empower-login-page';
import { Transaction } from '../types/transaction';

export type EmpowerTransaction = {
  Date: string;
  Account: string;
  Description: string;
  Category: string;
  Tags: string;
  Amount: string;
};

class EmpowerTransactionPage extends Page {
  private fileName = 'transactions.csv';

  private retryCount = 5;

  get downloadCsvButton() {
    return $('button[data-testid="csv-btn"]');
  }

  get sideBarAccount() {
    return $$('tr.pc-datagrid__row');
  }

  get tableRows() {
    return $$('div.pc-transactions-grid-cell--date');
  }

  private async download(count: number = 0): Promise<Transaction[]> {
    if (count >= this.retryCount) {
      return this.download(count + 1);
    }

    await this.cleanFiles();
    await browser.waitUntil(() => this.downloadCsvButton && this.downloadCsvButton.isClickable());
    await browser.waitUntil(async () => {
      const items = await this.tableRows;
      return items.length > 0;
    });

    await browser.pause(3000);
    await this.downloadCsvButton.click();
    const transactionFile = await this.getTransactionFile();
    const transactionPath = path.join(downloadDir, transactionFile);

    const transactions: EmpowerTransaction[] = await csv({ headers: EMPOWER_TRANSACTION_HEADERS }).fromFile(
      transactionPath,
    );

    if (transactions.length === 0) {
      throw new Error('Downloaded transaction list is empty');
    }

    return transactions.map((t) => ({
      date: t.Date,
      account: t.Account,
      description: t.Description,
      amount: t.Amount,
    }));
  }

  async downloadTransactions(): Promise<Transaction[]> {
    await EmpowerLoginPage.open();
    await EmpowerLoginPage.loginToAccount();
    await this.open();
    return this.download();
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

  private async getTransactionFile() {
    await browser.waitUntil(() => {
      const files = fs.readdirSync(`${downloadDir}/`);
      return files.some((f) => f.endsWith(this.fileName));
    });

    const files = fs.readdirSync(`${downloadDir}/`);
    return files.find((f) => f.endsWith(this.fileName)) ?? '';
  }

  async getAllAccountBalances() {
    await this.openNetWorth();
    await browser.waitUntil(async () => (await this.sideBarAccount.length) > 0);

    const accountList = await this.sideBarAccount;
    const accountItemsHTML = await Promise.all(
      accountList.map((accountListItem) => accountListItem.getHTML()),
    );

    const accountBalanceEntries = accountItemsHTML.map((html) => {
      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s/g, '')
        .replace(/\n/g, '');

      const accountNumber = text.match(/Endingin(\d{4})/)?.[1];
      const balance = text.match(/(-?\$.+\.\d{2})/)?.[1];
      return [accountNumber, balance];
    });

    const balances = Object.fromEntries(accountBalanceEntries);
    return balances;
  }

  open() {
    return super.open('https://ira.empower-retirement.com/dashboard/#/all-transactions');
  }

  openNetWorth() {
    return super.open('https://ira.empower-retirement.com/dashboard/#/net-worth');
  }
}

export default new EmpowerTransactionPage();
