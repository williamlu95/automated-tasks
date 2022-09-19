import Page from './page';

class GmailEmailPage extends Page {
  get buttons() {
    return $$('div[role="button"]');
  }

  get composeButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Compose'));
  }

  get sendButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Send'));
  }

  get toInput() {
    return $('textarea[name="to"]');
  }

  get subjectInput() {
    return $('input[name="subjectbox"]');
  }

  get textBox() {
    return $('div[role="textbox"]');
  }

  get emailRows() {
    return $$('tr[role="row"]');
  }

  get checkboxAll() {
    return $('span[role="checkbox"]');
  }

  get deleteIcon() {
    return $('div[aria-label="Delete"]');
  }

  async deleteAllEmails() {
    await browser.waitUntil(() => this.checkboxAll && this.checkboxAll.isClickable());
    await this.checkboxAll.click();
    await browser.waitUntil(() => this.deleteIcon && this.deleteIcon.isClickable());
    await this.deleteIcon.click();
    await browser.pause(2000);
  }

  async getEmail(emailSubject) {
    await browser.waitUntil(() => this.emailRows);
    const email = await this.emailRows.find(async (emailRow) => (
      await emailRow.getText()).includes(emailSubject));
    return email.getText();
  }

  async sendEmail(value) {
    await browser.pause(2000);
    await this.composeButton.click();
    await browser.pause(2000);
    await this.toInput.setValue('williamlu95@gmail.com');
    await this.subjectInput.setValue('Daily Balance Verification');
    await this.textBox.click();
    await browser.pause(2000);
    await this.textBox.setValue(value);
    await this.sendButton.click();
    await browser.pause(5000);
  }

  open() {
    return super.open('https://mail.google.com/mail/u/0/#inbox');
  }
}

export default new GmailEmailPage();
