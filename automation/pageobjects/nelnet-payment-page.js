import Page from './page';

class NelnetPaymentPage extends Page {
  get buttons() {
    return $$('button.btn-success');
  }

  get radioButtons() {
    return $$('[type="radio"]');
  }

  get amountInput() {
    return $('input#E874747530');
  }

  get continueButton() {
    return $('button.pay-schedule-button');
  }

  get proceedButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Proceed to Confirmation'));
  }

  get payNowButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Pay Now'));
  }

  get paySuccessMessage() {
    return $('div.payment-confirmation-text');
  }

  get inputGroup() {
    return $('div.input-group');
  }

  async setAmount(amount) {
    await this.amountInput.setValue(amount);
    await this.inputGroup.click();
    await browser.waitUntil(() => this.continueButton.isClickable());
    await this.continueButton.click();
  }

  async chooseBank() {
    await browser.waitUntil(() => this.proceedButton && this.proceedButton.isClickable());
    await browser.waitUntil(() => this.radioButtons.length);
    await this.proceedButton.click();
  }

  async pay() {
    await browser.waitUntil(() => this.payNowButton && this.payNowButton.isClickable());
    await this.payNowButton.click();
    await browser.waitUntil(() => this.paySuccessMessage && this.paySuccessMessage.isClickable());
  }

  open() {
    return super.open('https://www.nelnet.com/Payment/Index');
  }
}

export default new NelnetPaymentPage();
