export const TEMPLATE_TYPE = Object.freeze({
  CHASE_INCOME: 'Chase Income',
  WELLS_FARGO_INCOME: 'Wells Fargo Income',
});

class AddRecordModal {
  get buttons() {
    return $$('button[type="button"]');
  }

  get content() {
    return $('div.record-content');
  }

  get dropdowns() {
    return $$('div[role="listbox"]');
  }

  get options() {
    return $$('div[role="option"]');
  }

  get amountInput() {
    return $('input[name="amount"]');
  }

  get fromAmountInput() {
    return $('input[name="fromAmount"]');
  }

  get items() {
    return $$('a.item');
  }

  get transferItem() {
    return this.items.find(async (item) => (await item.getText()).includes('Transfer'));
  }

  get addRecordButton() {
    return this.buttons.find(async (button) => (await button.getText()).includes('Add record'));
  }

  get selectTemplateDropdown() {
    return this.dropdowns.find(async (d) => (await d.getText()).includes('Select template'));
  }

  get toAccountDropdown() {
    return $('div[name="toAccountId"]');
  }

  async selectOption(optionText) {
    await browser.waitUntil(() => this.options.length);
    const option = await this.options.find(async (o) => (await o.getText()).includes(optionText));
    await option.click();
  }

  async addRecord(template, amount) {
    await browser.waitUntil(() => this.content);
    await browser.waitUntil(
      () => this.selectTemplateDropdown && this.selectTemplateDropdown.isClickable(),
    );

    await this.selectTemplateDropdown.click();
    await this.selectOption(template);
    await this.amountInput.setValue(amount);
    await this.addRecordButton.click();
  }

  async addTransferFromChase(toAccount, amount) {
    await browser.waitUntil(() => this.content);
    await browser.waitUntil(
      () => this.transferItem && this.transferItem.isClickable(),
    );

    await this.transferItem.click();

    await browser.waitUntil(
      () => this.toAccountDropdown && this.toAccountDropdown.isClickable(),
    );

    await this.toAccountDropdown.click();
    await this.selectOption(toAccount);
    await this.fromAmountInput.setValue(amount);
    await this.addRecordButton.click();
  }
}

export default new AddRecordModal();
