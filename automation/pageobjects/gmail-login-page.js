import Page from './page';
import GmailEmailPage from './gmail-email-page';

const {
  GMAIL_LOGIN,
  GMAIL_PASSWORD,
} = process.env;

class GmailLoginPage extends Page {
  get buttons() {
    return $$('button');
  }

  get usernameInput() {
    return $('input[type="email"]');
  }

  get passwordInput() {
    return $('input[type="password"]');
  }

  get nextButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Next'));
  }

  async getMintVerificationCode() {
    await browser.newWindow('https://accounts.google.com/AccountChooser/signinchooser?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=AccountChooser');
    const handles = await browser.getWindowHandles();
    await browser.switchToWindow(handles[1]);
    await this.login();
    const emailText = await GmailEmailPage.getEmail('Your Mint code');
    const { 1: verificationCode } = emailText.match(/Verification code: (\d+)/);
    await GmailEmailPage.deleteAllEmails();
    await browser.closeWindow();
    await browser.switchToWindow(handles[0]);
    return verificationCode;
  }

  async login(expectedUrl = 'https://mail.google.com/mail/u/0/#inbox') {
    await browser.waitUntil(() => this.usernameInput && this.usernameInput.isClickable());
    await browser.pause(5000);
    await this.usernameInput.setValue(GMAIL_LOGIN);
    await this.nextButton.click();
    await browser.waitUntil(() => this.passwordInput.isClickable());
    await this.passwordInput.setValue(GMAIL_PASSWORD);
    await this.nextButton.click();
    await browser.waitUntil(async () => {
      const url = await browser.getUrl();
      return url.includes(expectedUrl);
    });
  }

  open() {
    return super.open('https://accounts.google.com/AccountChooser/signinchooser?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=AccountChooser');
  }
}

export default new GmailLoginPage();
