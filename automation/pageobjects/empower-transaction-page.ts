import * as fs from 'fs';
import * as path from 'path';
import Page from './page';
import { downloadDir } from '../utils/file';

class EmpowerTransactionPage extends Page {
  private fileName = 'transactions.csv';

  get downloadCsvButton() {
    return $('button[data-testid="csv-btn"]');
  }

  get sideBarAccount() {
    return $$('div.qa-sidebar-account-header');
  }

  async downloadTransactions(): Promise<string> {
    await browser.waitUntil(() => this.downloadCsvButton && this.downloadCsvButton.isClickable());
    await this.downloadCsvButton.click();
    await browser.pause(5000);
    const transactionFile = await this.getTransactionFile();
    return path.join(downloadDir, transactionFile);
  }

  private async getTransactionFile() {
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
