import Page from './page';

const {
  WALLET_LOGIN = '',
  WALLET_PASSWORD = '',
} = process.env;

class WalletLoginPage extends Page {
  get usernameInput() {
    return $('input[type="email"]');
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
    await browser.waitUntil(async () => { 
        const hasUserInput = await this.usernameInput?.isClickable();
        const hasNoThankYou = await this.noThankYouButton?.isClickable();
        return hasUserInput || hasNoThankYou;
    });

    if (await this.noThankYouButton?.isClickable())
    {
        await this.noThankYouButton.click();
    }

    await this.usernameInput.setValue(WALLET_LOGIN);
    await this.passwordInput.setValue(WALLET_PASSWORD);
    await this.signInButton.click();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('https://web.budgetbakers.com/dashboard');
    });
  }

  open() {
    return super.open('https://web.budgetbakers.com/login');
  }
}

export default new WalletLoginPage();
