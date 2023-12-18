import { BalanceSheet } from '../types/transaction';
import Page from './page';

const { MOTHERS_GOOGLE_SHEET = '', JOINT_GOOGLE_SHEET = '' } = process.env;

const KEY = {
  BACKSPACE: '\uE003',
  ARROW_DOWN: '\uE015',
  ARROW_RIGHT: '\uE014',
  ARROW_LEFT: '\uE012',
};

const KEY_PRESS_TIMEOUT = 300;
const BALANCE_HEADERS = ['Name', 'Date', 'Amount', 'Overall'];

class GoogleBalanceSheetPage extends Page {
  async typeInCell(amount: string) {
    await browser.keys(KEY.BACKSPACE);
    await browser.pause(KEY_PRESS_TIMEOUT);

    for (let i = 0; i < amount.length; i += 1) {
      await browser.keys(amount[i]);
    }

    await browser.keys(KEY.ARROW_RIGHT);
    await browser.pause(KEY_PRESS_TIMEOUT);
  }

  async clearSheet() {
    await browser.keys(['Meta', 'a']);
    await browser.keys(KEY.BACKSPACE);
  }

  async setHeaders() {
    await browser.keys(['Meta', 'b']);

    for (let i = 0; i < BALANCE_HEADERS.length; i++) {
      await this.typeInCell(BALANCE_HEADERS[i]);
    }

    await browser.keys(['Meta', 'b']);
    await browser.pause(KEY_PRESS_TIMEOUT);
  }

  async resetToNextRow() {
    await browser.keys(KEY.ARROW_DOWN);
    await browser.pause(KEY_PRESS_TIMEOUT);

    for (let i = 0; i < BALANCE_HEADERS.length; i++) {
      await browser.keys(KEY.ARROW_LEFT);
      await browser.pause(KEY_PRESS_TIMEOUT);
    }
  }

  async setBalances(balances: BalanceSheet[]) {
    await browser.pause(5000);
    await this.clearSheet();
    await this.setHeaders();
    await this.resetToNextRow();

    for (let i = 0; i < balances.length; i += 1) {
      const balance = balances[i];
      await this.typeInCell(balance.name);
      await this.typeInCell(balance.date);
      await this.typeInCell(balance.amount);
      await this.typeInCell(balance.overall);
      await this.resetToNextRow();
    }
  }

  openMothersBalanceSheet() {
    return super.open(MOTHERS_GOOGLE_SHEET);
  }

  openJointBalanceSheet() {
    return super.open(JOINT_GOOGLE_SHEET);
  }
}

export default new GoogleBalanceSheetPage();
