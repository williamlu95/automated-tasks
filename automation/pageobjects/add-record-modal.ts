import { DateTime } from 'luxon';
import Page from './page';

class AddRecordModal extends Page {
  get templateDropdown() {
    return $('input[placeholder="Select template"]');
  }

  get addButton() {
    return $('button[type="submit"]');
  }

  get amountInput() {
    return $('input[data-path="amount"]');
  }

  get options() {
    return $$('div.mantine-Select-option');
  }

  get multiOptions() {
    return $$('div.mantine-Group-root');
  }

  get dateInput() {
    return $('button[data-path="recordDate"]');
  }

  get close() {
    return $('button.mantine-CloseButton-root');
  }

  get labelDropdown() {
    return $('input[data-path="labels"]');
  }

  get items() {
    return $$('span.mantine-SegmentedControl-innerLabel');
  }

  get transferCategory() {
    return $('div.mantine-SegmentedControl-root > div:nth-child(4) > label');
  }

  async getDateAndClose() {
    await browser.waitUntil(() => this.dateInput.isExisting());
    const date = await this.dateInput.getValue();
    await this.close.click();
    return DateTime.fromFormat(date, 'dd/LL/yyyy HH:mm').toFormat('MM/dd/yyyy');
  }

  get fromAccountDropdown() {
    return $('input[data-path="accountId"]');
  }

  get toAccountDropdown() {
    return $('input[data-path="transferAccountId"]');
  }

  get noteInput() {
    return $('textarea[data-path="note"]');
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

  async selectMultiOption(optionText: string): Promise<void> {
    await browser.waitUntil(async () => {
      const options = await this.multiOptions;
      return !!options.length;
    });

    const options = await this.options;
    const option = await this.getElementFromList(options, optionText);
    await this.waitAndClick(option);
  }

  async addRecord(template: string, amount: string) {
    const dropdown = await this.templateDropdown;
    await this.waitAndClick(dropdown);
    await this.selectOption(template);
    await this.amountInput.setValue(amount);
    const addRecordButton = await this.addButton;
    await this.waitAndClick(addRecordButton);
  }

  async selectLabel() {
    await this.labelDropdown.click();
    await browser.pause(3000);
    await this.multiOptions[0].click();
    await this.amountInput.click();
  }

  async addTransfer(fromAccount: string, toAccount: string, amount: number) {
    await browser.waitUntil(
      async () => {
        const transfer = await this.transferCategory;
        const isClickable = await transfer.isClickable();
        return isClickable;
      },
    );

    await this.transferCategory.click();

    await browser.waitUntil(
      () => this.fromAccountDropdown && this.fromAccountDropdown.isClickable(),
    );

    await this.fromAccountDropdown.click();
    await this.selectOption(fromAccount);
    await browser.waitUntil(() => this.toAccountDropdown && this.toAccountDropdown.isClickable());
    await this.toAccountDropdown.click();
    await this.selectOption(toAccount);
    await this.amountInput.setValue(amount);
    await this.selectLabel();
    const addRecordButton = await this.addButton;
    await this.waitAndClick(addRecordButton);
  }
}

export default new AddRecordModal();
