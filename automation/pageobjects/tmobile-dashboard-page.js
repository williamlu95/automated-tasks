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

  async payBill() {
    await browser.waitUntil(() => this.balanceContent && this.balanceContent.isExisting());

    const balanceContentText = await this.balanceContent.getText();
    const balanceAmount = balanceContentText.match(/([-]{0,1}\$\d+.\d+)/)?.[1];
    if (parseFloat(balanceAmount.replace('$', '')) <= 0) {
      return '';
    }

    await super.open('https://www.t-mobile.com/payments/onetimepayment');
    await browser.pause(5000);

    await browser.waitUntil(async () => (await this.radioButtons.length) > 0);
    const totalBalance = await this.radioButtons
      .find(async (c) => (await c.getText()).includes('Total Balance'));

    await totalBalance.click();

    const agreeAndSubmitButton = await this.buttons
      .find(async (c) => (await c.getText()).includes('Agree & submit'));

    agreeAndSubmitButton.click();
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
