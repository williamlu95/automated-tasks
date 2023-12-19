import { Balance, BalanceSheet } from '../types/transaction';
import Page from './page';

const { MOTHERS_GOOGLE_SHEET = '', JOINT_GOOGLE_SHEET = '', GOOGLE_SHEET = '' } = process.env;

const KEY = {
  BACKSPACE: '\uE003',
  ARROW_DOWN: '\uE015',
  ARROW_RIGHT: '\uE014',
  ARROW_LEFT: '\uE012',
};

const KEY_PRESS_TIMEOUT = 300;
const BALANCE_HEADERS = ['Name', 'Date', 'Amount', 'Overall'];
const CC_BALANCE_HEADERS = ['Name', 'Expected Balance', 'Actual Balance', 'Difference'];

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

  async setHeaders(headers: string[]) {
    for (let i = 0; i < headers.length; i++) {
      await this.typeInCell(headers[i]);
    }
  }

  async resetToNextRow(headers: string[]) {
    await browser.keys(KEY.ARROW_DOWN);
    await browser.pause(KEY_PRESS_TIMEOUT);

    for (let i = 0; i < headers.length; i++) {
      await browser.keys(KEY.ARROW_LEFT);
      await browser.pause(KEY_PRESS_TIMEOUT);
    }
  }

  async setBalances(balances: BalanceSheet[]) {
    await browser.pause(5000);
    await this.clearSheet();
    await this.setHeaders(BALANCE_HEADERS);
    await this.resetToNextRow(BALANCE_HEADERS);

    for (let i = 0; i < balances.length; i += 1) {
      const balance = balances[i];
      await this.typeInCell(balance.name);
      await this.typeInCell(balance.date);
      await this.typeInCell(balance.amount);
      await this.typeInCell(balance.overall);
      await this.resetToNextRow(BALANCE_HEADERS);
    }
  }

  async setCreditBalances(balances: Balance[]) {
    await browser.pause(5000);
    await this.clearSheet();
    await this.setHeaders(CC_BALANCE_HEADERS);
    await this.resetToNextRow(CC_BALANCE_HEADERS);

    for (let i = 0; i < balances.length; i += 1) {
      const balance = balances[i];
      await this.typeInCell(balance.accountName);
      await this.typeInCell(balance.expectedBalance);
      await this.typeInCell(balance.actualBalance);
      await this.typeInCell(balance.difference);
      await this.resetToNextRow(CC_BALANCE_HEADERS);
    }
  }

  openMothersBalanceSheet() {
    return super.open(MOTHERS_GOOGLE_SHEET);
  }

  openJointBalanceSheet() {
    return super.open(JOINT_GOOGLE_SHEET);
  }

  openPersonalBalanceSheet() {
    return super.open(GOOGLE_SHEET);
  }
}

export default new GoogleBalanceSheetPage();
