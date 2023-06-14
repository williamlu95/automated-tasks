import LoginPage from '../../pageobjects/wallet-login-page';
import { runAddIncomeToWallet } from './add-income-to-wallet';
import { runAddPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';

describe('Manage finances in wallet app', () => {
  before(async () => {
    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const incomeTransactions = transactions.getIncomeTransactions();
    const paymentTransactions = transactions.getPaymentTransactions();

    if (incomeTransactions.length || paymentTransactions.length) {
      await LoginPage.open();
      await LoginPage.login();
    }

    if (incomeTransactions.length) {
      runAddIncomeToWallet(incomeTransactions);
    }

    if (paymentTransactions.length) {
      runAddPaymentsToWallet(paymentTransactions);
    }
  });

  context('when the tests need to run', () => {
    it('should run the tests', () => expect(true).toEqual(true));
  });
});
