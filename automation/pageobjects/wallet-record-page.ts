import { WALLET_ACCOUNT } from '../constants/personal-transactions';
import { formatFromDollars } from '../utils/currency-formatter';
import AddRecordModal from './add-record-modal';
import Page from './page';

class WalletRecordPage extends Page {
  get dateRangeDropdown() {
    return $('div.date-range-picker > div.dropdown');
  }

  get dateRangeCheckbox() {
    return $$('div.date-range-picker__predefined-values-container > div.checkbox');
  }

  get filterDropdown() {
    return $('div[name="selectFilter"]');
  }

  get options() {
    return $$('div.visible > div[role="option"]');
  }

  get transactionTypes() {
    return $$('div._8i-eheZb5L24RqIZiPgP8');
  }

  get payees() {
    return $$('div._35LBhpdB_XRla_m6WK5Eys');
  }

  get transferNames() {
    return $$('div._1yNGMXuFq364Pg-thcczh2');
  }

  get amounts() {
    return $$('div._2incM6fyIxbGkeydtYoltF');
  }

  get rows() {
    return $$('div._3oJhqSCX8H5S0i6pA59f9k');
  }

  get ellipsis() {
    return $$('i.ellipsis');
  }

  get confirmButton() {
    return $('button.ui.red.circular.fluid.button');
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

  async selectCheckbox(optionText: string): Promise<void> {
    await browser.waitUntil(async () => {
      const options = await this.dateRangeCheckbox;
      return !!options.length;
    });

    const options = await this.dateRangeCheckbox;
    const option = await this.getElementFromList(options, optionText);
    await this.waitAndClick(option);
  }

  async getTransactionCounts() {
    await this.open();

    await browser.waitUntil(async () => (await this.dateRangeDropdown).isClickable());
    await this.dateRangeDropdown.click();
    await this.selectCheckbox('This month');

    await browser.waitUntil(async () => (await this.filterDropdown).isClickable());
    await this.filterDropdown.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    await this.selectOption('Automated Script Filter');
    await browser.pause(3000);

    const transactionTypes = await this.transactionTypes;
    const transactionTypeTexts = await Promise.all(transactionTypes.map((tt) => tt.getText()));

    const rows = await this.rows;
    const rowsText = await Promise.all(rows.map((r) => r.getText()));

    const transferNames = await this.transferNames;
    const transferNameTexts = (await Promise.all(transferNames.map((tt) => tt.getText()))).filter(
      (tnt) => !tnt.includes('Chase Checking'),
    );

    return {
      chaseIncome: transactionTypeTexts.filter((tt) => tt.includes('Income')).length,
      capitalOnePayments: rowsText.filter((r) => r.includes('Autopay')).filter((r) => r.includes(WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X)).length,
      amexGold: rowsText.filter((r) => r.includes('Autopay')).filter((r) => r.includes(WALLET_ACCOUNT.AMEX_GOLD)).length,

      citiDoublePayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CITI_DOUBLE_CASH)).length,
      citiCustomPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CITI_CUSTOM_CASH)).length,
      citiPremierPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CITI_PREMIER)).length,
      chaseAmazonPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_AMAZON)).length,
      chaseFlexPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_FREEDOM_FLEX)).length,
      chaseUnlimitedPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED)).length,
      chaseSapphirePayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_SAPPHIRE_PREFERRED)).length,
      discoverPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.DISCOVER_IT)).length,
      wellsFargoActiveCashPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.WF_ACTIVE_CASH)).length,
      wellsFargoPlatinumPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.WF_PLATINUM)).length,
    };
  }

  async getGrocerySpend() {
    await this.open();

    await browser.waitUntil(async () => (await this.dateRangeDropdown).isClickable());
    await this.dateRangeDropdown.click();
    await this.selectCheckbox('This month');

    await browser.waitUntil(async () => (await this.filterDropdown).isClickable());
    await this.filterDropdown.click();
    await browser.waitUntil(async () => (await this.options.length) > 0);
    await this.selectOption('Monthly Grocery');
    await browser.pause(3000);

    const amounts = await this.amounts;
    const amountsText = await Promise.all(amounts.map((a) => a.getText()));
    return amountsText.reduce((total, amount) => total + formatFromDollars(amount), 0);
  }

  async getPendingTransactions() {
    await this.open();

    await browser.waitUntil(async () => (await this.dateRangeDropdown).isClickable());
    await this.dateRangeDropdown.click();
    await this.selectCheckbox('This month');

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

    return datesText.map((date, index) => ({ date, amount: formatFromDollars(amountsText[index]) }));
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
