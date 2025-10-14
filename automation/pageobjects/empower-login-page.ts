import { readPersonalEmails, verificationCodes } from '../utils/notification';
import Page from './page';

const {
  EMPOWER_LOGIN = '',
  EMPOWER_PASSWORD = '',
} = process.env;

class EmpowerLoginPage extends Page {
  get acceptCookiesButton() {
    return $('button#onetrust-accept-btn-handler');
  }

  get usernameInput() {
    return $('input[name="username"]');
  }

  get continueButton() {
    return $('button[name="continue"]');
  }

  get emailMeButton() {
    return $('button[value="challengeEmail"]');
  }

  get textMeButton() {
    return $('button[value="challengeSMS"]');
  }

  get codeInput() {
    return $('input[name="code"]');
  }

  get codeInputs() {
    return $$('input[name="code"]');
  }

  get submitButton() {
    return $('button[type="submit"]');
  }

  get submitButtons() {
    return $$('button[type="submit"]');
  }

  get userLink() {
    return $('a#userId');
  }

  async getSubmitCodeButton() {
    await browser.waitUntil(async () => {
      const items = await this.submitButtons;
      return !!items.length;
    });

    const items = await this.submitButtons;
    return this.getElementFromList(items, 'continue');
  }

  get submitCodeButton() {
    return $('button.js-totp-submit-code');
  }

  get rememberMeCheckbox() {
    return $('input#rememberMe');
  }

  get passwordInput() {
    return $('input[type="password"]');
  }

  get deviceInput() {
    return $('input[name="deviceName"]');
  }

  get signInButton() {
    return $('button[name="sign-in"]');
  }

  get submitUsernameButton() {
    return $('button[data-testid="IdentifierFirstSubmitButton"]');
  }

  get submitPasswordButton() {
    return $('button[data-testid="passwordVerificationContinueButton"]');
  }

  private async completeVerification(readEmails: () => Promise<void>) {
    await browser.waitUntil(() => this.emailMeButton && this.emailMeButton.isClickable());
    await this.emailMeButton.click();

    await browser.waitUntil(async () => {
      await readEmails();
      return !!verificationCodes.empower;
    });

    await this.codeInput.setValue(verificationCodes.empower);
    const button = await this.getSubmitCodeButton();
    await button.click();
  }

  private async acceptCookie() {
    await browser.pause(5000);
    const cookiesButtonExists = await this.acceptCookiesButton.isExisting();

    if (cookiesButtonExists) {
      await this.acceptCookiesButton.click();
    }
  }

  private async login(username: string, password: string, readEmails: () => Promise<void>) {
    await browser.pause(5000);
    if (!(await this.usernameInput.isExisting()) && !(await this.passwordInput.isExisting())) {
      return;
    }

    if (await this.usernameInput.isExisting() && await this.usernameInput.isClickable()) {
      await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
      await this.acceptCookie();
      await this.usernameInput.setValue(username);
      await this.continueButton.click();
      await this.completeVerification(readEmails);
    }

    await browser.waitUntil(async () => {
      const isPassword = await this.passwordInput.isClickable();
      return isPassword;
    });

    await this.passwordInput.setValue(password);
    if (await this.deviceInput.isExisting() && await this.deviceInput.isClickable()) {
      await browser.waitUntil(() => this.deviceInput.isClickable());
      await this.deviceInput.setValue('Automated Scripts');
    }

    await this.signInButton.click();

    await browser.waitUntil(() => this.userLink && this.userLink.isDisplayed());
  }

  async loginToAccount() {
    await this.login(EMPOWER_LOGIN, EMPOWER_PASSWORD, readPersonalEmails);
  }

  open() {
    return super.open('https://home.personalcapital.com/page/login/app#/all-transactions');
  }
}

export default new EmpowerLoginPage();
