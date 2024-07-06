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
    return $$('div[role="option"]');
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

    const transferNames = await this.transferNames;
    const transferNameTexts = (await Promise.all(transferNames.map((tt) => tt.getText()))).filter(
      (tnt) => !tnt.includes('Chase Checking'),
    );

    const payees = await this.payees;
    const payeeTexts = (await Promise.all(payees.map((tt) => tt.getText())));

    return {
      chaseIncome: transactionTypeTexts.filter((tt) => tt.includes('Income')).length,

      waterBill: payeeTexts.filter((pt) => pt.includes('Water')).length,
      sewerBill: payeeTexts.filter((pt) => pt.includes('Sewer')).length,
      carInsuranceBill: payeeTexts.filter((pt) => pt.includes('Car Insurance')).length,
      internetBill: payeeTexts.filter((pt) => pt.includes('Internet')).length,
      trashBill: payeeTexts.filter((pt) => pt.includes('Trash')).length,

      citiPayments: transferNameTexts.filter((tt) => tt.includes('Citi')).length,
      capitalOnePayments: transferNameTexts.filter((tt) => tt.includes('Capital One')).length,
      chasePayments: transferNameTexts.filter((tt) => tt.includes('Chase')).length,
      discoverPayments: transferNameTexts.filter((tt) => tt.includes('Discover It')).length,
    };
  }

  open() {
    return super.open('https://web.budgetbakers.com/records');
  }
}

export default new WalletRecordPage();
