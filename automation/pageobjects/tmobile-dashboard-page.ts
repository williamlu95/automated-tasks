import Page from './page';

class TmobileDashboardPage extends Page {
  get balanceContent() {
    return $('div.balanceContent');
  }

  get radioButtons() {
    return $$('mat-radio-button');
  }

  get buttons() {
    return $$('button[type="button"]');
  }

  get oneTimePayment() {
    return $('p[data-testid="otp-confirmation-pageDescription"]');
  }

  async getTotalBalance() {
    await browser.waitUntil(async () => (await this.radioButtons.length) > 0);
    const radioButtons = await this.radioButtons;
    return this.getElementFromList(radioButtons, 'Total Balance');
  }

  async getAgreeAndSubmitButton() {
    await browser.waitUntil(async () => (await this.buttons.length) > 0);
    const buttons = await this.buttons;
    return this.getElementFromList(buttons, 'Agree & submit');
  }

  async payBill(): Promise<string |undefined> {
    await browser.waitUntil(() => this.balanceContent && this.balanceContent.isExisting());

    const balanceContentText = await this.balanceContent.getText();
    const balanceAmount = balanceContentText.match(/([-]{0,1}\$\d+.\d+)/)?.[1];
    if (parseFloat((balanceAmount || '').replace('$', '')) <= 0) {
      return '';
    }

    await super.open('https://www.t-mobile.com/payments/onetimepayment');
    await browser.pause(5000);

    await browser.waitUntil(async () => (await this.radioButtons.length) > 0);
    const totalBalance = await this.getTotalBalance();
    await totalBalance.click();

    const agreeAndSubmitButton = await this.getAgreeAndSubmitButton();
    await agreeAndSubmitButton.click();
    await browser.waitUntil(() => this.oneTimePayment && this.oneTimePayment.isExisting());
    const oneTimePaymentText = await this.oneTimePayment.getText();
    const amountPaid = oneTimePaymentText.match(/was charged \$(\d+\.\d+)/)?.[1];
    return amountPaid;
  }

  open() {
    return super.open('https://www.t-mobile.com/account/dashboard');
  }
}

export default new TmobileDashboardPage();
