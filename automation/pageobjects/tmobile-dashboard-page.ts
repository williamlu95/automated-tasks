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

  get agreeAndSubmitButton() {
    return $('button[tmo-layout="last@md first"]');
  }

  async payBill() {
    await browser.waitUntil(() => this.balanceContent && this.balanceContent.isExisting());

    const balanceContentText = await this.balanceContent.getText();
    const balanceAmount = balanceContentText.match(/([-]{0,1}\$\d+.\d+)/)?.[1];
    if (parseFloat(balanceAmount?.replace('$', '') || '0') <= 0) {
      return;
    }

    await super.open('https://www.t-mobile.com/payments/onetimepayment');
    await browser.pause(5000);

    await browser.waitUntil(async () => (await this.radioButtons.length) > 0);
    const radioButtons = await this.radioButtons;
    const totalBalance = radioButtons
      .find(async (c) => (await c.getText()).includes('Total Balance'));

    await totalBalance?.click();

    await browser.waitUntil(() => this.agreeAndSubmitButton && this.agreeAndSubmitButton.isExisting());
    await this.agreeAndSubmitButton.click();
    await browser.waitUntil(() => this.oneTimePayment && this.oneTimePayment.isExisting());
  }

  open() {
    return super.open('https://www.t-mobile.com/account/dashboard');
  }
}

export default new TmobileDashboardPage();
