import AddRecordModal, { TEMPLATE_TYPE } from './add-record-modal';
import Page from './page';

class WalletDashboardPage extends Page {
  get buttons() {
    return $$('button[type="button"]');
  }

  get records() {
    return $$('li._3wwqabSSUyshePYhPywONa');
  }

  get accountCards() {
    return $$('div.SyMiivK1mSUOBri3EYnVo');
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

  async addRecord(template, amount) {
    const accountCardIndex = template === TEMPLATE_TYPE.CHASE_INCOME ? 0 : 3;
    await browser.waitUntil(() => this.buttons.length);
    await browser.waitUntil(() => this.accountCards.length);
    const initalBalance = await this.accountCards[accountCardIndex].getText();
    await this.addRecordButton.click();
    await AddRecordModal.addRecord(template, amount);
    await browser.waitUntil(async () => {
      const newBalance = await this.accountCards[accountCardIndex].getText();
      return newBalance !== initalBalance;
    });
  }

  async addTransferFromChase(toAccount, amount) {
    await browser.waitUntil(() => this.buttons.length);
    await browser.waitUntil(() => this.accountCards.length);
    const initalBalance = await this.accountCards[0].getText();
    await this.addRecordButton.click();
    await AddRecordModal.addTransferFromChase(toAccount, amount);
    await browser.waitUntil(async () => {
      const newBalance = await this.accountCards[0].getText();
      return newBalance !== initalBalance;
    });
  }

  open() {
    return super.open('https://web.budgetbakers.com/dashboard');
  }
}

export default new WalletDashboardPage();
