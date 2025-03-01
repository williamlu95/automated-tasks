import { DateTime } from 'luxon';
import Page from './page';
import { INCOME } from '../constants/joint-transactions';
import { formatFromDollars } from '../utils/currency-formatter';

const NAME = Object.freeze({
  SUNRISE: 'Sunrise Hospital',
  PTO: 'To Lisa\'s PTO Vault',
});

const ACCOUNT = Object.freeze({
  FROM: 'SoFi Checking',
  TO: 'Lisa\'s PTO',
});

class SofiLoginPage extends Page {
  get transferSubmit() {
    return $('button#transferSubmit');
  }

  get transferConfirm() {
    return $('button#transferConfirm');
  }

  get rows() {
    return $$('tr > td.col6 > button > span.visually-hidden');
  }

  get accountRows() {
    return $$('span[data-qa="txt-account-name"]');
  }

  get accountRadio() {
    return $$('label.sc-iHmpnF.dMYmeb');
  }

  get amountInput() {
    return $('input[name="amount"]');
  }

  get doneButton() {
    return $('button[data-qa="btn-account-select"]');
  }

  get fromButton() {
    return $('button[data-qa="btn-account-select-from"]');
  }

  get toButton() {
    return $('button[data-qa="btn-account-select-to"]');
  }

  async getAllTransactions() {
    await browser.waitUntil(async () => {
      const rows = await this.rows;
      return !!rows.length;
    });

    const rows = await this.rows;
    const rowsText = await Promise.all(rows.map((row) => row.getText()));

    const rowObj = rowsText.map((text) => ({
      date: DateTime.fromFormat(text.match(/Transaction. Date: (.+). Description/)?.[1] || 'January 1, 2024', 'DDD'),
      name: text.match(/Description: (.+). Amount/)?.[1] || '',
      amount: text.match(/Amount: (.+)./)?.[1] || '',
    }))
      .filter((row) => (Object.values(NAME) as string[]).includes(row.name))
      .filter((row) => row.date.hasSame(DateTime.now(), 'month'));

    return rowObj;
  }

  async clickAccount(name: string) {
    await browser.waitUntil(async () => {
      const rows = await this.accountRows;
      return !!rows.length;
    });

    const rows = await this.accountRows;
    const rowsText = await Promise.all(rows.map((row) => row.getText()));
    const rowIndex = rowsText.findIndex((rowText) => rowText.includes(name));

    if (rowIndex < 0) {
      throw new Error(`Account ${name} was not found.`);
    }

    const radios = await this.accountRows;
    await radios[rowIndex]?.click();
    await this.doneButton.click();
  }

  round(num: number) {
    return Math.round(num * 100) / 100;
  }

  async moveExcessToPTO() {
    const [transaction] = await this.getAllTransactions();
    const isAlreadyMoved = transaction?.name === NAME.PTO;
    const excessAmount = this.round(formatFromDollars(transaction.amount) - INCOME.LISA_SALARY.amount);

    if (isAlreadyMoved || excessAmount <= 1.0) {
      return;
    }

    super.open(`https://www.sofi.com/my/money/account/${process.env.SOFI_ACCOUNT}/transfer`);
    await browser.waitUntil(() => this.amountInput && this.amountInput.isClickable());
    await this.amountInput.setValue(excessAmount);
    await this.fromButton.click();
    await this.clickAccount(ACCOUNT.FROM);

    await this.toButton.click();
    await this.clickAccount(ACCOUNT.TO);

    const hasFromAccount = (await this.fromButton.getText()).includes(ACCOUNT.FROM);
    const hasToAccount = (await this.toButton.getText()).includes(ACCOUNT.TO);

    if (!hasFromAccount || !hasToAccount) {
      throw new Error('Either the from or to account does not match what should be expected.');
    }

    await browser.waitUntil(() => this.transferSubmit && this.transferSubmit.isClickable());
    await this.transferSubmit.click();
    await browser.waitUntil(() => this.transferConfirm && this.transferConfirm.isClickable());
    await this.transferConfirm.click();

    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return !url.endsWith('/transfer/confirm');
    });
  }

  open() {
    return super.open('https://www.sofi.com/my/money/account/');
  }
}

export default new SofiLoginPage();
