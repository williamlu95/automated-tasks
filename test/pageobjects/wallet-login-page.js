import Page from './page';

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

  async login(username, password) {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await this.usernameInput.setValue(username);
    await this.passwordInput.setValue(password);
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
