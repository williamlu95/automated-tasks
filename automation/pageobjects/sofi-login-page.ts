import Page from './page';
import { readPersonalEmails, verificationCodes } from '../utils/notification';

const {
  SOFI_LOGIN = '', SOFI_PASSWORD = '',
} = process.env;

class SofiLoginPage extends Page {
  get usernameInput() {
    return $('input#username');
  }

  get nextButton() {
    return $('button#lp1-next-btn');
  }

  get passwordInput() {
    return $('input#password');
  }

  get loginButton() {
    return $('button[type="submit"]');
  }

  get codeInput() {
    return $('input[name="code"]');
  }

  get continueButton() {
    return $('button[type="submit"]');
  }

  get acceptCookiesButton() {
    return $('button#onetrust-accept-btn-handler');
  }

  get rememberMeBox() {
    return $('label[for="rememberBrowser"]');
  }

  async login() {
    await this.open();
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await this.usernameInput.setValue(SOFI_LOGIN);
    await browser.waitUntil(() => this.passwordInput && this.passwordInput.isClickable());
    await this.passwordInput.setValue(SOFI_PASSWORD);
    await browser.waitUntil(() => this.loginButton && this.loginButton.isClickable());
    await this.loginButton.click();

    await browser.pause(5000);
    const isCodeVerification = await this.codeInput.isExisting();
    if (!isCodeVerification) {
      return;
    }

    await browser.waitUntil(async () => {
      await readPersonalEmails();
      return !!verificationCodes.sofi;
    });

    await browser.waitUntil(() => this.codeInput && this.codeInput.isClickable());
    await this.codeInput.setValue(verificationCodes.sofi);

    await browser.waitUntil(() => this.continueButton && this.continueButton.isClickable());
    await this.continueButton.click();
    await browser.pause(5000);
  }

  async acceptCookes() {
    await browser.pause(5000);
    const isButtonExisting = await this.acceptCookiesButton.isExisting();

    if (isButtonExisting) {
      await this.acceptCookiesButton.click();
    }
  }

  open() {
    return super.open('https://www.sofi.com/login/');
  }
}

export default new SofiLoginPage();
