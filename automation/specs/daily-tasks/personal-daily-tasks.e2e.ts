import LoginPage from '../../pageobjects/wallet-login-page';
import { addTransactionToWallet } from './add-transaction-to-wallet';
import { addPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';
import { verifyAccountBalance } from './verify-account-balances';
import { readPersonalEmails } from '../../utils/notification';

describe('Personal daily tasks', () => {
  before(async () => {
    readPersonalEmails(false);

    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const templateTransactions = transactions.getTemplateTransactions();
    console.log(`Template Transactions: ${JSON.stringify(templateTransactions, null, 4)}`);
    const paymentTransactions = transactions.getPaymentTransactions();
    console.log(`Payment Transactions: ${JSON.stringify(paymentTransactions, null, 4)}`);

    await LoginPage.open();
    await LoginPage.login();

    if (templateTransactions.length) {
      await addTransactionToWallet(templateTransactions);
    }

    if (paymentTransactions.length) {
      await addPaymentsToWallet(paymentTransactions);
    }

    await verifyAccountBalance(transactions.getBalances());
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
