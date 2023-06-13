import LoginPage from '../../pageobjects/wallet-login-page';
import { runAddIncomeToWallet } from './add-income-to-wallet';
import { Transactions } from './transactions';

describe('Manage finances in wallet app', () => {
  before(async () => {
    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const incomeTransactions = transactions.getIncomeTransactions();

    if (incomeTransactions.length) {
      await LoginPage.open();
      await LoginPage.login();
      runAddIncomeToWallet(incomeTransactions);
    }
  });

  context('when the tests need to run', () => {
    it('should run the tests', () => expect(true).toEqual(true));
  });
});
