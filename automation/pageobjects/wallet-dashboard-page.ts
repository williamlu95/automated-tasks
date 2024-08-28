import AddRecordModal from './add-record-modal';
import Page from './page';
import LoginPage from './wallet-login-page';

class WalletDashboardPage extends Page {
  private balanceKey = 'wallet-balance';

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

  async getAccountBalanceByName(name: string) {
    await browser.waitUntil(async () => (await this.accountNames.length) > 0);
    const cardIndex = await this.accountNames.findIndex(async (c) => (await c.getText()).includes(name));

    const balances = await this.accountBalances;
    return balances[cardIndex];
  }

  async getBalanceByName(accountName: string) {
    const accountBalance = await this.getAccountBalanceByName(accountName);
    return accountBalance.getText();
  }

  get newestRecord() {
    return $('li._3wwqabSSUyshePYhPywONa');
  }

  get totalBalance() {
    return $('div.oqwtuxHo2EIxsIRwczWqR');
  }

  async getAddRecordButton() {
    await browser.waitUntil(async () => (await this.buttons.length) > 0);
    const buttons = await this.buttons;
    return this.getElementFromList(buttons, 'Record');
  }

  async getAllAccountBalances() {
    const cachedBalances = await browser.sharedStore.get(this.balanceKey);

    if (cachedBalances) {
      return cachedBalances;
    }

    await browser.waitUntil(async () => (await this.accountBalances.length) > 0);
    const accountBalances = await this.accountBalances;
    const balances = await Promise.all(accountBalances.map((b) => b.getText()));

    const accountNames = await this.accountNames;
    const names = await Promise.all(accountNames.map((n) => n.getText()));

    return Object.fromEntries(names.map((name, i) => [name, balances[i]]));
  }

  async loginAndGetAllAccountBalances() {
    const cachedBalances = await browser.sharedStore.get(this.balanceKey);

    if (cachedBalances) {
      return cachedBalances;
    }

    await LoginPage.open();
    await LoginPage.login();

    return this.getAllAccountBalances();
  }

  async addRecord(template: string, accountCardName: string, amount: string) {
    const initalBalance = await this.getAccountBalanceByName(accountCardName);
    const addRecordButton = await this.getAddRecordButton();
    await this.waitAndClick(addRecordButton);
    await AddRecordModal.addRecord(template, amount);
    await browser.waitUntil(async () => {
      const newBalance = await this.getAccountBalanceByName(accountCardName);
      return newBalance !== initalBalance;
    });
  }

  async addTransfer(fromAccount: string, toAccount: string, amount: number) {
    await browser.waitUntil(async () => (await this.buttons.length) > 0);
    await browser.waitUntil(async () => (await this.accountNames.length) > 0);
    const initalBalance = await this.getAccountBalanceByName(fromAccount);
    const addRecordButton = await this.getAddRecordButton();
    await this.waitAndClick(addRecordButton);
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
