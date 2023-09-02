import Page from './page';

class AddRecordModal extends Page {
  get buttons() {
    return $$('button[type="button"]');
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

  async getTransferItem() {
    await browser.waitUntil(async () => {
      const items = await this.items;
      return !!items.length;
    });

    const items = await this.items;
    return this.getElementFromList(items, 'Transfer');
  }

  async getAddRecordButton() {
    await browser.waitUntil(async () => {
      const buttons = await this.buttons;
      return !!buttons.length;
    });

    const dropdowns = await this.buttons;
    return this.getElementFromList(dropdowns, 'Add record');
  }

  async getSelectTemplateDropdown() {
    await browser.waitUntil(async () => {
      const dropdowns = await this.dropdowns;
      return !!dropdowns.length;
    });

    const dropdowns = await this.dropdowns;
    return this.getElementFromList(dropdowns, 'Select template');
  }

  get fromAccountDropdown() {
    return $('div[name="fromAccountId"]');
  }

  get toAccountDropdown() {
    return $('div[name="toAccountId"]');
  }

  get noteInput() {
    return $('textarea[name="note"]');
  }

  async selectOption(optionText: string): Promise<void> {
    await browser.waitUntil(async () => {
      const options = await this.options;
      return !!options.length;
    });

    const options = await this.options;
    const option = await this.getElementFromList(options, optionText);
    await this.waitAndClick(option);
  }

  async addRecord(template: string, amount: string) {
    const dropdown = await this.getSelectTemplateDropdown();
    await this.waitAndClick(dropdown);
    await this.selectOption(template);
    await this.amountInput.setValue(amount);
    const addRecordButton = await this.getAddRecordButton();
    await this.waitAndClick(addRecordButton);
  }

  async addTransfer(fromAccount: string, toAccount: string, amount: string) {
    const transferItem = await this.getTransferItem();
    await this.waitAndClick(transferItem);

    await browser.waitUntil(
      () => this.fromAccountDropdown && this.fromAccountDropdown.isClickable(),
    );

    await this.fromAccountDropdown.click();
    await this.selectOption(fromAccount);

    await browser.waitUntil(
      () => this.toAccountDropdown && this.toAccountDropdown.isClickable(),
    );

    await this.toAccountDropdown.click();
    await this.selectOption(toAccount);
    await this.fromAmountInput.setValue(amount);
    await this.noteInput.setValue('Added by automated script');
    const addRecordButton = await this.getAddRecordButton();
    await this.waitAndClick(addRecordButton);
  }
}

export default new AddRecordModal();
