import DashBoardPage from '../../pageobjects/wallet-dashboard-page';
import { WALLET_ACCOUNT, INCOME_TEMPLATE_TYPE, EXPENSE_TEMPLATE_TYPE } from '../../constants/account';

const BANK_TEXT = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: {
    template: INCOME_TEMPLATE_TYPE.CHASE_INCOME,
  },
  [WALLET_ACCOUNT.WELLS_FARGO_CHECKING]: {
    template: INCOME_TEMPLATE_TYPE.WELLS_FARGO_INCOME,
  },
  [WALLET_ACCOUNT.CITI_DOUBLE_CASH]: {
    template: EXPENSE_TEMPLATE_TYPE.CITI_DOUBLE_EXPENSE,
  },
};

export const runAddTransactionToWallet = (transactions = []) => context('when there are transactions to add', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  transactions.forEach(({ amount, type }) => context(`when adding ${Math.abs(amount)} to ${type}`, () => {
    it(`should add the transaction to the ${type} balance`, async () => {
      const { template } = BANK_TEXT[type];
      const initalBalance = await DashBoardPage.getBalanceByName(type);
      await DashBoardPage.addRecord(template, type, Math.abs(amount));
      const actualBalance = await DashBoardPage.getBalanceByName(type);
      const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount);

      expect(actualBalance).toContain(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
      );
    });
  }));
});
