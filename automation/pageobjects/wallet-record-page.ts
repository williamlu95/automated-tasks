import { WALLET_ACCOUNT } from '../constants/personal-transactions';
import { formatFromDollars } from '../utils/currency-formatter';
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

    const payees = await this.payees;
    const payeeTexts = (await Promise.all(payees.map((tt) => tt.getText())));

    return {
      chaseIncome: transactionTypeTexts.filter((tt) => tt.includes('Income')).length,
      marriottBonvoy: rowsText.filter((r) => r.includes('Autopay')).filter((r) => r.includes(WALLET_ACCOUNT.MARRIOTT_BOUNDLESS)).length,
      amexGold: rowsText.filter((r) => r.includes('Autopay')).filter((r) => r.includes(WALLET_ACCOUNT.AMEX_GOLD)).length,

      waterBill: payeeTexts.filter((pt) => pt.includes('Water')).length,
      sewerBill: payeeTexts.filter((pt) => pt.includes('Sewer')).length,
      ufcFitBill: payeeTexts.filter((pt) => pt.includes('UFC Fit')).length,
      carInsuranceBill: payeeTexts.filter((pt) => pt.includes('Car Insurance')).length,
      internetBill: payeeTexts.filter((pt) => pt.includes('Internet')).length,
      trashBill: payeeTexts.filter((pt) => pt.includes('Trash')).length,
      spotifyBill: payeeTexts.filter((pt) => pt.includes('Spotify')).length,
      citiDoublePayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CITI_DOUBLE_CASH)).length,
      citiCustomPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CITI_CUSTOM_CASH)).length,
      capitalOnePayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X)).length,
      chaseAmazonPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_AMAZON)).length,
      chaseFlexPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_FREEDOM_FLEX)).length,
      chaseUnlimitedPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED)).length,
      discoverPayments: transferNameTexts.filter((tt) => tt.includes(WALLET_ACCOUNT.DISCOVER_IT)).length,
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

  open() {
    return super.open('https://web.budgetbakers.com/records');
  }
}

export default new WalletRecordPage();
