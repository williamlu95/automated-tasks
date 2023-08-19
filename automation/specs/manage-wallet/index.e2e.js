import LoginPage from '../../pageobjects/wallet-login-page';
import { runAddTransactionToWallet } from './add-transaction-to-wallet';
import { runAddPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';
import { runVerifyAccountBalances } from './verify-account-balances';
import { runPayTmobileBill } from './pay-tmobile-bill';
import { readEmails } from '../../utils/notification';

describe('Manage finances in wallet app', () => {
  before(async () => {
    readEmails(false);
    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const templateTransactions = transactions.getTemplateTransactions();
    const paymentTransactions = transactions.getPaymentTransactions();

    runPayTmobileBill(templateTransactions);

    await LoginPage.open();
    await LoginPage.login();

    if (templateTransactions.length) {
      runAddTransactionToWallet(templateTransactions);
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
