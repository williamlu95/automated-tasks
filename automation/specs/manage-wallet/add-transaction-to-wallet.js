import { TRANSACTION_TYPE } from '../../constants/transaction';
import DashBoardPage from '../../pageobjects/wallet-dashboard-page';

export const runAddTransactionToWallet = (transactions = []) => context('when there are transactions to add', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  transactions.forEach(({
    amount,
    walletAccountName,
    template,
    type,
  }) => context(`when adding ${Math.abs(amount)} to ${walletAccountName}`, () => {
    it(`should add the transaction to the ${walletAccountName} balance`, async () => {
      const initalBalance = await DashBoardPage.getBalanceByName(walletAccountName);
      await DashBoardPage.addRecord(template, walletAccountName, Math.abs(amount));
      const actualBalance = await DashBoardPage.getBalanceByName(walletAccountName);

      const expectedBalance = TRANSACTION_TYPE.CREDIT === type
        ? (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount)
        : (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) - Math.abs(amount);

      expect(actualBalance).toContain(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
      );
    });
  }));
});
