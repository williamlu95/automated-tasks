import { readEmails } from '../utils/notification';
import Page from './page';

const {
  MINT_LOGIN,
  MINT_PASSWORD,
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

  async completeVerification() {
    await browser.pause(5000);

    const url = await browser.getUrl();

    // if (url.includes('https://mint.intuit.com/transactions')) {
    //   return;
    // }

    // const isVerificationFlow = await this.emailCodeButton.isExisting();

    // if (!isVerificationFlow) {
    //   return;
    // }

    await this.emailCodeButton.click();
    await readEmails();
    await browser.waitUntil(() => global.emailInbox.some((e) => e.subject.includes('Your Mint Account')));
    // const verificationCode = '';
    // await this.verificationInput.setValue(verificationCode);
    // await this.verificationContinueButton.click();
  }

  async skipBiometricQuestion() {
    await browser.pause(5000);

    const url = await browser.getUrl();

    if (!url.includes('https://mint.intuit.com/transactions')) {
      await this.biometricSkipButton.click();
    }
  }

  async login() {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await browser.pause(5000);
    await this.usernameInput.setValue(MINT_LOGIN);
    await this.submitUsernameButton.click();
    await browser.waitUntil(() => this.passwordInput.isClickable());
    await this.passwordInput.setValue(MINT_PASSWORD);
    await this.submitPasswordButton.click();
    await this.completeVerification();
    await this.skipBiometricQuestion();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes('https://mint.intuit.com/transactions');
    });
  }

  open() {
    return super.open('https://mint.intuit.com/transactions');
  }
}

export default new MintLoginPage();
