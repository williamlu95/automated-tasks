import * as fs from 'fs';
import * as path from 'path';
import Page from './page';
import { downloadDir } from '../utils/file';

class EmpowerTransactionPage extends Page {
  private fileName = 'transactions.csv';

  get downloadCsvButton() {
    return $('button[data-testid="csv-btn"]');
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

  open() {
    return super.open('https://home.personalcapital.com/page/login/app#/all-transactions');
  }
}

export default new EmpowerTransactionPage();
