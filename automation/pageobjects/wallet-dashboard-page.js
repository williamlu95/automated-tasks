import AddRecordModal from './add-record-modal';
import Page from './page';

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
    const accountBalances = await this.accountBalances;
    const balances = await Promise.all(
      accountBalances.map((b) => b.getText()),
    );

    const accountNames = await this.accountNames;
    const names = await Promise.all(
      accountNames.map((n) => n.getText()),
    );

    return Object.fromEntries(names.map((name, i) => [name, balances[i]]));
  }

  async addRecord(template, accountCardName, amount) {
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
