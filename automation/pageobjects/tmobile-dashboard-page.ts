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

    await super.open('https://www.t-mobile.com/payments/onetimepayment');
    await browser.pause(5000);

    await browser.debug();
    await browser.waitUntil(async () => (await this.radioButtons.length) > 0);
    const radioButtons = await this.radioButtons;
    const totalBalance = radioButtons
      .find(async (c) => (await c.getText()).includes('Total Balance'));

    await totalBalance?.click();

    const buttons = await this.buttons;
    const agreeAndSubmitButton = buttons
      .find(async (c) => (await c.getText()).includes('Agree & submit'));

    agreeAndSubmitButton?.click();
    await browser.waitUntil(() => this.oneTimePayment && this.oneTimePayment.isExisting());
  }

  open() {
    return super.open('https://www.t-mobile.com/account/dashboard');
  }
}

export default new TmobileDashboardPage();
