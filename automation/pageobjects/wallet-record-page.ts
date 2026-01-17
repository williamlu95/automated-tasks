import { WALLET_ACCOUNT } from '../constants/personal-transactions';
import { formatFromDollars } from '../utils/currency-formatter';
import AddRecordModal from './add-record-modal';
import Page from './page';

class WalletRecordPage extends Page {
  get filterDropdown() {
    return $('input[placeholder="Select filter"]');
  }

  get options() {
    return $$('div.mantine-Select-option');
  }

  get rows() {
    return $$('div.grid-cols-record-row-withCheckbox');
  }

  get transactionTypes() {
    return $$(
      'div.grid-cols-record-row-withCheckbox > div.flex.items-center.gap-3',
    );
  }

  get transferNames() {
    return $$('div.grid-cols-record-row-withCheckbox > p:first-child');
  }

  get amounts() {
    return $$(
      'div.grid-cols-record-row-withCheckbox > div.flex.items-center.justify-end.gap-2 > div > p',
    );
  }

  get ellipsis() {
    return $$('i.ellipsis');
  }

  get confirmButton() {
    return $('button.ui.red.circular.fluid.button');
  }

  get recordsLink() {
    return $('a[href="/records"]');
  }

  async navigateToRecords() {
    await browser.waitUntil(async () => (await this.recordsLink).isClickable());
    await this.recordsLink.click();
    await browser.pause(3000);
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

  private truncateAccountName(accountName: string): string {
    const maxLength = 18;

    if (accountName.length <= maxLength) {
      return accountName;
    }

    return `${accountName.slice(0, maxLength)}...`;
  }

  private isTransfer(text: string): boolean {
    return text.includes('Transfer, withdraw') || text.includes('Unknown');
  }

  async getTransactionCounts() {
    await this.navigateToRecords();

    await browser.waitUntil(async () => (await this.filterDropdown).isClickable());
    await this.filterDropdown.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    await this.selectOption('Automated Script Filter');
    await browser.pause(3000);

    const rows = await this.rows;
    const rowTexts = await Promise.all(rows.map((r) => r.getText()));

    return {
      chaseIncome: rowTexts.filter((r) => r.includes('Income')).length,
      capitalOnePayments: rowTexts
        .filter((r) => r.includes('Autopay'))
        .filter((r) => r.includes(
          this.truncateAccountName(WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X),
        )).length,
      amexGold: rowTexts
        .filter((r) => r.includes('Autopay'))
        .filter((r) => r.includes(this.truncateAccountName(WALLET_ACCOUNT.AMEX_GOLD))).length,

      citiCustomPayments: rowTexts
        .filter(this.isTransfer)
        .filter((r) => r.includes(this.truncateAccountName(WALLET_ACCOUNT.CITI_CUSTOM_CASH))).length,
      chaseAmazonPayments: rowTexts
        .filter(this.isTransfer)
        .filter((r) => r.includes(this.truncateAccountName(WALLET_ACCOUNT.CHASE_AMAZON))).length,
      chaseFlexPayments: rowTexts
        .filter(this.isTransfer)
        .filter((r) => r.includes(
          this.truncateAccountName(WALLET_ACCOUNT.CHASE_FREEDOM_FLEX),
        )).length,
      discoverPayments: rowTexts
        .filter(this.isTransfer)
        .filter((r) => r.includes(this.truncateAccountName(WALLET_ACCOUNT.DISCOVER_IT))).length,
    };
  }

  async getGrocerySpend() {
    await this.navigateToRecords();

    await browser.waitUntil(async () => (await this.filterDropdown).isClickable());
    await this.filterDropdown.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    await this.selectOption('Monthly Grocery');
    await browser.pause(3000);

    const amounts = await this.amounts;
    const amountsText = await Promise.all(amounts.map((a) => a.getText()));
    return amountsText.reduce(
      (total, amount) => total + formatFromDollars(amount),
      0,
    );
  }

  async getPendingTransactions() {
    await this.navigateToRecords();

    await browser.waitUntil(async () => (await this.filterDropdown).isClickable());
    await this.filterDropdown.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    await this.selectOption('Pending');
    await browser.pause(3000);

    const amounts = await this.amounts;
    const datesText = [];
    const amountsText = await Promise.all(amounts.map((a) => a.getText()));

    for (let i = 0; i < amounts.length; i += 1) {
      await amounts[i].click();
      const date = await AddRecordModal.getDateAndClose();
      datesText.push(date);
    }

    return datesText.map((date, index) => ({
      date,
      amount: formatFromDollars(amountsText[index]),
    }));
  }

  async removeRecord(index: number) {
    const ellipsis = await this.ellipsis;
    await ellipsis[index].click();
    await this.selectOption('Delete');
    await browser.waitUntil(async () => (await this.confirmButton).isClickable());
    await this.confirmButton.click();
    await browser.pause(3000);
  }

  open() {
    return super.open('https://web.budgetbakers.com/records');
  }
}

export default new WalletRecordPage();
