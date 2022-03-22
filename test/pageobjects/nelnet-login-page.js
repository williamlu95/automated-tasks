import Page from './page';

class NelnetLoginPage extends Page {
  get usernameInput() {
    return $('input#username');
  }

  get passwordInput() {
    return $('input#Password');
  }

  get submitUsernameButton() {
    return $('button#submit-username');
  }

  get submitPasswordButton() {
    return $('button#submit-password');
  }

  async login(username, password) {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await browser.pause(5000);
    await this.usernameInput.setValue(username);
    await this.submitUsernameButton.click();
    await browser.waitUntil(() => this.passwordInput.isClickable());
    await this.passwordInput.setValue(password);
    await this.submitPasswordButton.click();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('https://www.nelnet.com/Home');
    });
  }

  open() {
    return super.open('https://www.nelnet.com/welcome');
  }
}

export default new NelnetLoginPage();
