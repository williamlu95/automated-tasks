import DashBoardPage from '../../pageobjects/wallet-dashboard-page';
import { WALLET_ACCOUNT, BANK_NAME, TEMPLATE_TYPE } from '../../constants/account';

const BANK_TEXT = {
  [BANK_NAME.CHASE]: {
    template: TEMPLATE_TYPE.CHASE_INCOME,
  },
  [BANK_NAME.WELLS_FARGO]: {
    template: TEMPLATE_TYPE.WELLS_FARGO_INCOME,
  },
};

export const runAddIncomeToWallet = (transactions = []) => context('when there are income transactions', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  transactions.forEach(({ amount, type }) => context(`when adding ${Math.abs(amount)} to ${type}`, () => {
    it(`should add the income to the ${type} balance`, async () => {
      const { template } = BANK_TEXT[type];
      const accountCardName = template === TEMPLATE_TYPE.CHASE_INCOME
        ? WALLET_ACCOUNT.CHASE_CHECKING
        : WALLET_ACCOUNT.WELLS_FARGO_CHECKING;

      const initalBalance = await DashBoardPage.getBalanceByName(accountCardName);
      await DashBoardPage.addRecord(template, Math.abs(amount));
      const actualBalance = await DashBoardPage.getBalanceByName(accountCardName);
      const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount);

      expect(actualBalance).toContain(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
      );
    });
  }));
});
