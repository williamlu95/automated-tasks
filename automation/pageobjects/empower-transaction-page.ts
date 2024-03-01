import * as csv from 'csvtojson';
import * as fs from 'fs';
import * as path from 'path';
import Page from './page';
import { downloadDir } from '../utils/file';
import { TRANSACTION_HEADERS } from '../constants/transaction';
import { Transaction } from '../types/transaction';

class EmpowerTransactionPage extends Page {
  private fileName = 'transactions.csv';

  get downloadCsvButton() {
    return $('button[data-testid="csv-btn"]');
  }

  get sideBarAccount() {
    return $$('div.qa-sidebar-account-header');
  }

  async downloadTransactions(): Promise<Transaction[]> {
    await this.cleanFiles();
    await browser.waitUntil(() => this.downloadCsvButton && this.downloadCsvButton.isClickable());
    await this.downloadCsvButton.click();
    const transactionFile = await this.getTransactionFile();
    const transactionPath = path.join(downloadDir, transactionFile);

    await browser.waitUntil(
      async () => !!(await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionPath)).length
    );

    return csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionPath);
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
    await browser.waitUntil(async () => (await this.sideBarAccount.length) > 0);

    const accountList = await this.sideBarAccount;
    const accountItemsHTML = await Promise.all(
      accountList.map((accountListItem) => accountListItem.getHTML())
    );

    const accountBalanceEntries = accountItemsHTML.map((html) => {
      const text = html
        .replace(/<[^>]*>/g, '')
        .replace(/\s/g, '')
        .replace(/\n/g, '');

      const accountNumber = text.match(/Endingin(\d{4})/)?.[1];
      const balance = text.match(/(\$.+\.\d{2})/)?.[1];
      return [accountNumber, balance];
    });

    return Object.fromEntries(accountBalanceEntries);
  }

  open() {
    return super.open('https://home.personalcapital.com/page/login/app#/all-transactions');
  }
}

export default new EmpowerTransactionPage();
