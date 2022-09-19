/* eslint-disable no-await-in-loop */
import Page from './page';
import GmailLoginPage from './gmail-login-page';

const KEY = {
  BACKSPACE: '\uE003',
  ARROW_DOWN: '\uE015',
  ARROW_RIGHT: '\uE014',
  ARROW_LEFT: '\uE012',
};

const KEY_PRESS_TIMEOUT = 300;

class BalanceSheetPage extends Page {
  async typeAmount(amount) {
    await browser.keys(KEY.BACKSPACE);
    await browser.pause(KEY_PRESS_TIMEOUT);

    for (let i = 0; i < amount.length; i += 1) {
      await browser.keys(amount[i]);
    }
  }

  async setBalances(balances) {
    await browser.pause(5000);
    await browser.keys(KEY.ARROW_DOWN);
    await browser.pause(KEY_PRESS_TIMEOUT);
    await browser.keys(KEY.ARROW_RIGHT);
    await browser.pause(KEY_PRESS_TIMEOUT);

    for (let i = 0; i < balances.length; i += 1) {
      const [expected, actual] = balances[i];
      await this.typeAmount(expected);
      await browser.keys(KEY.ARROW_RIGHT);
      await browser.pause(KEY_PRESS_TIMEOUT);
      await this.typeAmount(actual);
      await browser.keys(KEY.ARROW_DOWN);
      await browser.pause(KEY_PRESS_TIMEOUT);
      await browser.keys(KEY.ARROW_LEFT);
      await browser.pause(KEY_PRESS_TIMEOUT);
    }
  }

  async openAndLogin() {
    await this.open();
    const url = await browser.getUrl();

    if (url.startsWith('https://docs.google.com')) {
      return;
    }

    await GmailLoginPage.login('https://docs.google.com');
    await this.open();
  }

  open() {
    return super.open('https://docs.google.com/spreadsheets/d/1TI4G7Rk_jZwVDPCxY6j5Pr-zwbH9X87VuF-0Kmahs88/edit#gid=1886976065');
  }
}

export default new BalanceSheetPage();
