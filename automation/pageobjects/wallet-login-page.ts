import { readPersonalEmails, verificationCodes } from '../utils/notification';
import Page from './page';

const {
  WALLET_LOGIN = '',
} = process.env;

class WalletLoginPage extends Page {
  get usernameInput() {
    return $('input[data-path="email"]');
  }

  get passwordInput() {
    return $('input[type="password"]');
  }

  get signInButton() {
    return $('button[type="submit"]');
  }

  get noThankYouButton() {
    return $('div.feedback-actions > button');
  }

  async login() {
    await browser.pause(10000);
    const currentUrl = await browser.getUrl();
    if (currentUrl.includes('dashboard')) {
      return;
    }

    await browser.waitUntil(async () => {
      const hasUserInput = await this.usernameInput?.isClickable();
      const hasNoThankYou = await this.noThankYouButton?.isClickable();
      return hasUserInput || hasNoThankYou;
    });

    if (await this.noThankYouButton?.isExisting() && await this.noThankYouButton?.isClickable()) {
      await this.noThankYouButton.click();
    }

    await this.usernameInput.click();
    await this.usernameInput.clearValue();
    await this.usernameInput.setValue(WALLET_LOGIN);
    await this.signInButton.click();

    await browser.waitUntil(async () => {
      await readPersonalEmails();
      return !!verificationCodes.wallet;
    });

    await super.open(`https://web.budgetbakers.com/sso?ssoToken=${verificationCodes.wallet}`);

    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('https://web.budgetbakers.com/dashboard');
    });
  }

  open() {
    return super.open('https://web.budgetbakers.com/sign-in');
  }
}

export default new WalletLoginPage();
