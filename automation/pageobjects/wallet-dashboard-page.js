import AddRecordModal from './add-record-modal';
import Page from './page';
import { WALLET_ACCOUNT, TEMPLATE_TYPE } from '../constants/account';

class WalletDashboardPage extends Page {
  get buttons() {
    return $$('button[type="button"]');
  }

  get records() {
    return $$('li._3wwqabSSUyshePYhPywONa');
  }

  get accountNames() {
    return $$('div._3UlH-xKQJweod8d_ZaUvH9');
  }

  get accountBalances() {
    return $$('div.SyMiivK1mSUOBri3EYnVo');
  }

  async getAccountBalanceByName(name) {
    await browser.waitUntil(async () => (await this.accountNames.length) > 0);
    const cardIndex = await this.accountNames
      .findIndex(async (c) => (await c.getText()).includes(name));

    const balances = await this.accountBalances;
    return balances[cardIndex];
  }

  async getBalanceByName(accountName) {
    const accountBalance = await this.getAccountBalanceByName(accountName);
    return accountBalance.getText();
  }

  get newestRecord() {
    return $('li._3wwqabSSUyshePYhPywONa');
  }

  get totalBalance() {
    return $('div.oqwtuxHo2EIxsIRwczWqR');
  }

  get addRecordButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Record'));
  }

  async getAllAccountBalances() {
    await browser.waitUntil(async () => (await this.accountBalances.length) > 0);
    const accountList = await this.accountBalances;
    return Promise.all(
      accountList.map((accountListItem) => accountListItem.getText()),
    );
  }

  async addRecord(template, amount) {
    const accountCardName = template === TEMPLATE_TYPE.CHASE_INCOME
      ? WALLET_ACCOUNT.CHASE_CHECKING
      : WALLET_ACCOUNT.WELLS_FARGO_CHECKING;

    const initalBalance = await this.getAccountBalanceByName(accountCardName);
    await this.addRecordButton.click();
    await AddRecordModal.addRecord(template, amount);
    await browser.waitUntil(async () => {
      const newBalance = await this.getAccountBalanceByName(accountCardName);
      return newBalance !== initalBalance;
    });
  }

  async addTransfer(fromAccount, toAccount, amount) {
    await browser.waitUntil(() => this.buttons.length);
    await browser.waitUntil(() => this.accountNames.length);
    const initalBalance = await this.getAccountBalanceByName(fromAccount);
    await this.addRecordButton.click();
    await AddRecordModal.addTransfer(fromAccount, toAccount, amount);
    await browser.waitUntil(async () => {
      const newBalance = await this.getAccountBalanceByName(fromAccount);
      return newBalance !== initalBalance;
    });
  }

  open() {
    return super.open('https://web.budgetbakers.com/dashboard');
  }
}

export default new WalletDashboardPage();
