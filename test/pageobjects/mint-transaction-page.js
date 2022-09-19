import Page from './page';

class MintTransactionPage extends Page {
  get bankAccountTab() {
    return $('button[aria-controls="react-collapsed-toggle-5"]');
  }

  get creditAccountTab() {
    return $('button#react-collapsed-toggle-6');
  }

  get accountListItems() {
    return $$('li.transactions-sidebar-account-list-item');
  }

  async getAllAccountBalances() {
    await browser.waitUntil(async () => (await this.accountListItems.length) > 0);

    const accountList = await this.accountListItems;
    const accountItemsHTML = await Promise.all(
      accountList.map((accountListItem) => accountListItem.getHTML()),
    );

    const accountBalanceEntries = accountItemsHTML.map((html) => {
      const { 1: accountNumber, 2: balance } = html.replace(/<[^>]*>/g, '').split(/\(\.\.\.(.+)\)/);
      return [accountNumber, balance];
    });
    return Object.fromEntries(accountBalanceEntries);
  }

  open() {
    return super.open('https://mint.intuit.com/transactions');
  }
}

export default new MintTransactionPage();
