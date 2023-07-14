import { TRANSACTION_TYPE } from '../../constants/account';
import DashBoardPage from '../../pageobjects/wallet-dashboard-page';

export const runAddTransactionToWallet = (transactions = []) => context('when there are transactions to add', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  transactions.forEach(({
    amount,
    name,
    template,
    type,
  }) => context(`when adding ${Math.abs(amount)} to ${name}`, () => {
    it(`should add the transaction to the ${name} balance`, async () => {
      const initalBalance = await DashBoardPage.getBalanceByName(name);
      await DashBoardPage.addRecord(template, name, Math.abs(amount));
      const actualBalance = await DashBoardPage.getBalanceByName(name);

      const expectedBalance = TRANSACTION_TYPE.CREDIT === type
        ? (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount)
        : (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) - Math.abs(amount);

      expect(actualBalance).toContain(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
      );
    });
  }));
});
