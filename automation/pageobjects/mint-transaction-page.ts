import * as fs from 'fs';
import * as path from 'path';
import Page from './page';
import { downloadDir } from '../utils/file';

class MintTransactionPage extends Page {
  get bankAccountTab() {
    return $('button[aria-controls="react-collapsed-toggle-5"]');
  }

  get creditAccountTab() {
    return $('button#react-collapsed-toggle-6');
  }

  get accountListItems() {
    return $$('li.transactions-sidebar-account-list-item');
  }

  get settingsButton() {
    return $('button[data-automation-id="TRANSACTION_SETTINGS"]');
  }

  get exportAllTransactionsButton() {
    return $('li[data-automation-id="EXPORT_ALL_TRANSACTIONS"]');
  }

  async getAllAccountBalances(): Promise<Record<string, string>> {
    await browser.waitUntil(async () => (await this.accountListItems.length) > 0);

    const accountList = await this.accountListItems;
    const accountItemsHTML = await Promise.all(
      accountList.map((accountListItem) => accountListItem.getHTML()),
    );

    const accountBalanceEntries = accountItemsHTML.map((html) => {
      const { 1: accountNumber, 2: balance } = html.replace(/<[^>]*>/g, '').split(/\(\.\.\.(.+)\)/);
      return [accountNumber, balance];
    });

    return Object.fromEntries(accountBalanceEntries);
  }

  async downloadTransactions(): Promise<string> {
    await browser.waitUntil(() => this.settingsButton && this.settingsButton.isClickable());
    await this.settingsButton.click();
    await this.exportAllTransactionsButton.click();
    const filePath = path.join(downloadDir, 'transactions.csv');
    await browser.waitUntil(() => fs.existsSync(filePath));
    return filePath;
  }

  open() {
    return super.open('https://mint.intuit.com/transactions');
  }
}

export default new MintTransactionPage();
