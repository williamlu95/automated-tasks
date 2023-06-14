import DashBoardPage from '../../pageobjects/wallet-dashboard-page';

export const runAddPaymentsToWallet = (transactions = []) => context('when there are credit card transactions', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  transactions.forEach(({ fromAccount, toAccount, amount }) => context(`when transfering ${Math.abs(amount)} to ${toAccount}`, () => {
    it(`should make the transfer from ${fromAccount} to ${toAccount}`, async () => {
      const initalBalance = await DashBoardPage.getBalanceByName(fromAccount);
      await DashBoardPage.addTransfer(fromAccount, toAccount, Math.abs(amount));
      const actualBalance = await DashBoardPage.getBalanceByName(fromAccount);
      const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) - Math.abs(amount);

      expect(actualBalance).toContain(
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
      );
    });
  }));
});
