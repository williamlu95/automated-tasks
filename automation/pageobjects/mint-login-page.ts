import {
  readPersonalEmails, verificationCodes, readMothersEmails, readJointEmails,
} from '../utils/notification';
import Page from './page';

const {
  MINT_LOGIN = '',
  MINT_PASSWORD = '',
  MOTHER_MINT_LOGIN = '',
  MOTHER_MINT_PASSWORD = '',
  JOINT_MINT_LOGIN = '',
  JOINT_MINT_PASSWORD = ''
} = process.env;

class MintLoginPage extends Page {
  get usernameInput() {
    return $('input[data-testid="IdentifierFirstIdentifierInput"]');
  }

  get passwordInput() {
    return $('input[data-testid="currentPasswordInput"]');
  }

  get submitUsernameButton() {
    return $('button[data-testid="IdentifierFirstSubmitButton"]');
  }

  get submitPasswordButton() {
    return $('button[data-testid="passwordVerificationContinueButton"]');
  }

  get emailCodeButton() {
    return $('button[data-testid="challengePickerOption_EMAIL_OTP"]');
  }

  get biometricSkipButton() {
    return $('button[data-testid="WebAuthnRegSkip"]');
  }

  get verificationInput() {
    return $('input[data-testid="VerifyOtpInput"]');
  }

  get verificationContinueButton() {
    return $('button[data-testid="VerifyOtpSubmitButton"]');
  }

  async completeVerification(readEmails: () => Promise<void>) {
    await browser.pause(5000);

    const url = await browser.getUrl();

    if (url.includes('https://mint.intuit.com/transactions')) {
      return;
    }

    const isVerificationFlow = await this.emailCodeButton.isExisting();

    if (!isVerificationFlow) {
      return;
    }

    await this.emailCodeButton.click();
    await browser.waitUntil(async () => {
      await readEmails();
      return !!verificationCodes.mint;
    });

    await this.verificationInput.setValue(verificationCodes.mint);
    await this.verificationContinueButton.click();
  }

  async skipBiometricQuestion() {
    await browser.pause(5000);

    const url = await browser.getUrl();

    if (!url.includes('https://mint.intuit.com/transactions')) {
      await this.biometricSkipButton.click();
    }
  }

  private async login(username: string, password: string, readEmails: () => Promise<void>) {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await browser.pause(5000);
    await this.usernameInput.setValue(username);
    await this.submitUsernameButton.click();
    await browser.waitUntil(() => this.passwordInput.isClickable());
    await this.passwordInput.setValue(password);
    await this.submitPasswordButton.click();
    await this.completeVerification(readEmails);
    await this.skipBiometricQuestion();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('https://mint.intuit.com/transactions');
    });
  }

  async loginToPersonal() {
    await this.login(MINT_LOGIN, MINT_PASSWORD, readPersonalEmails);
  }

  async loginToMothers() {
    await this.login(MOTHER_MINT_LOGIN, MOTHER_MINT_PASSWORD, readMothersEmails);
  }

  async loginToJoint() {
    await this.login(JOINT_MINT_LOGIN, JOINT_MINT_PASSWORD, readJointEmails);
  }

  open() {
    return super.open('https://mint.intuit.com/transactions');
  }
}

export default new MintLoginPage();
