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
    return $('input[name="usernameInput"]');
  }

  get textMeButton() {
    return $('button.button-container');
  }

  get codeInput() {
    return $('input[name="smsCode"]');
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
    return $('button[data-fired="Signing In"]');
  }

  get submitUsernameButton() {
    return $('button[data-testid="IdentifierFirstSubmitButton"]');
  }

  get submitPasswordButton() {
    return $('button[data-testid="passwordVerificationContinueButton"]');
  }

  get dismissModal() {
    return $('button[ng-click="bulletinDismiss(bulletin)"]');
  }

  private async completeVerification(readEmails: () => Promise<void>) {
    await browser.waitUntil(() => this.textMeButton && this.textMeButton.isClickable());
    await this.textMeButton.click();

    await browser.waitUntil(async () => {
      await readEmails();
      return !!verificationCodes.empower;
    });

    await this.codeInput.setValue(verificationCodes.empower);
    await this.submitButton.click();

    const currentUrl = await browser.getUrl();
    if (currentUrl.includes('/user/home')) {
      return;
    }

    await browser.waitUntil(
      async () => {
        const url = await browser.getUrl();
        return url.includes('/user/home');
      },
    );
  }

  private async acceptCookie() {
    await browser.pause(5000);
    const cookiesButtonExists = await this.acceptCookiesButton.isExisting();

    if (cookiesButtonExists) {
      await this.acceptCookiesButton.click();
    }
  }

  private async dismissBanner() {
    await browser.pause(5000);
    const modalExists = await this.dismissModal.isExisting();

    if (modalExists) {
      await this.dismissModal.click();
    }
  }

  private async login(username: string, password: string, readEmails: () => Promise<void>) {
    await browser.pause(5000);
    if (!(await this.usernameInput.isExisting()) && !(await this.passwordInput.isExisting())) {
      return;
    }

    await this.dismissBanner();
    await this.acceptCookie();
    await this.usernameInput.setValue(username);
    await this.passwordInput.setValue(password);
    await this.signInButton.click();

    await browser.pause(10000);
    const currentUrl = await browser.getUrl();
    if (currentUrl.includes('/user/home')) {
      return;
    }

    await this.completeVerification(readEmails);
  }

  async loginToAccount() {
    await this.login(EMPOWER_LOGIN, EMPOWER_PASSWORD, readPersonalEmails);
  }

  open() {
    return super.open('https://ira.empower-retirement.com/participant/#/sfd-login');
  }
}

export default new EmpowerLoginPage();
