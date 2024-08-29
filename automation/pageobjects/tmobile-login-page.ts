import Page from './page';
import { readPersonalEmails, verificationCodes } from '../utils/notification';

const {
  TMOBILE_LOGIN = '', TMOBILE_PASSWORD = '',
} = process.env;

class TmobileLoginPage extends Page {
  get usernameInput() {
    return $('input#usernameTextBox');
  }

  get nextButton() {
    return $('button#lp1-next-btn');
  }

  get passwordInput() {
    return $('input#passwordTextBox');
  }

  get loginButton() {
    return $('button#lp2-login-btn');
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
    return $('span.remember-this-device-text');
  }

  async login() {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await this.usernameInput.setValue(TMOBILE_LOGIN);
    await browser.waitUntil(() => this.nextButton && this.nextButton.isClickable());
    await this.nextButton.click();

    await browser.waitUntil(() => this.passwordInput && this.passwordInput.isClickable());
    await this.passwordInput.setValue(TMOBILE_PASSWORD);
    await browser.waitUntil(() => this.loginButton && this.loginButton.isClickable());
    await this.loginButton.click();

    await browser.pause(5000);
    const isCodeVerification = await (await this.continueButton).isExisting();

    if (!isCodeVerification) {
      return;
    }

    await browser.waitUntil(() => this.continueButton && this.continueButton.isClickable());
    await this.continueButton.click();

    await browser.waitUntil(async () => {
      await readPersonalEmails();
      return !!verificationCodes.tmobile;
    });

    await browser.waitUntil(() => this.codeInput && this.codeInput.isClickable());
    await this.codeInput.setValue(verificationCodes.tmobile);

    await browser.waitUntil(() => this.rememberMeBox && this.rememberMeBox.isClickable());
    await this.rememberMeBox.click();

    await browser.waitUntil(() => this.continueButton && this.continueButton.isClickable());
    await this.continueButton.click();
  }

  async acceptCookies() {
    await browser.pause(5000);
    const isButtonExisting = await this.acceptCookiesButton.isExisting();

    if (isButtonExisting) {
      await this.acceptCookiesButton.click();
    }
  }

  open() {
    return super.open('https://www.t-mobile.com/signin?state=eyJpbnRlbnQiOiJMb2dpbiIsImJvb2ttYXJrVXJsIjoiaHR0cHM6Ly93d3cudC1tb2JpbGUuY29tL2FjY291bnQvZGFzaGJvYXJkIn0=&INTNAV=tNav:LogIn');
  }
}

export default new TmobileLoginPage();
