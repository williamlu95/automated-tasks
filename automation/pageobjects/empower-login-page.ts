import {
  readPersonalEmails,
  verificationCodes,
  readJointEmails,
  readMothersEmails,
} from '../utils/notification';
import Page from './page';

const {
  EMPOWER_LOGIN = '',
  EMPOWER_PASSWORD = '',
  MOTHER_EMPOWER_LOGIN = '',
  MOTHER_EMPOWER_PASSWORD = '',
  JOINT_EMPOWER_LOGIN = '',
  JOINT_EMPOWER_PASSWORD = '',
} = process.env;

class EmpowerLoginPage extends Page {
  get usernameInput() {
    return $('input[name="username"]');
  }

  get continueButton() {
    return $('button[name="continue"]');
  }

  get emailMeButton() {
    return $('button[value="challengeEmail"]');
  }

  get codeInput() {
    return $('input[name="code"]');
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

  private async login(username: string, password: string, readEmails: () => Promise<void>) {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await this.usernameInput.setValue(username);
    await this.continueButton.click();
    await this.completeVerification(readEmails);
    await browser.waitUntil(() => this.rememberMeCheckbox.isClickable());
    await this.rememberMeCheckbox.click();
    await browser.waitUntil(() => this.passwordInput.isClickable());
    await this.passwordInput.setValue(password);
    await this.signInButton.click();
    await browser.waitUntil(() => this.userLink && this.userLink.isDisplayed());
  }

  async loginToPersonal() {
    await this.login(EMPOWER_LOGIN, EMPOWER_PASSWORD, readPersonalEmails);
  }

  async loginToJoint() {
    await this.login(JOINT_EMPOWER_LOGIN, JOINT_EMPOWER_PASSWORD, readJointEmails);
  }

  async loginToMother() {
    await this.login(MOTHER_EMPOWER_LOGIN, MOTHER_EMPOWER_PASSWORD, readMothersEmails);
  }

  open() {
    return super.open('https://home.personalcapital.com/page/login/app#/all-transactions');
  }
}

export default new EmpowerLoginPage();
