import LoginPage from '../../pageobjects/wallet-login-page';
import { runAddTransactionToWallet } from './add-transaction-to-wallet';
import { runAddPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';
import { runVerifyAccountBalances } from './verify-account-balances';

describe('Manage finances in wallet app', () => {
  before(async () => {
    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const walletTransactions = transactions.getWalletTransactions();
    const paymentTransactions = transactions.getPaymentTransactions();

    await LoginPage.open();
    await LoginPage.login();

    if (walletTransactions.length) {
      runAddTransactionToWallet(walletTransactions);
    }

    if (paymentTransactions.length) {
      runAddPaymentsToWallet(paymentTransactions);
    }

    runVerifyAccountBalances(transactions.getBalances());
  });

  context('when the tests need to run', () => {
    it('should run the tests', () => expect(true).toEqual(true));
  });
});
