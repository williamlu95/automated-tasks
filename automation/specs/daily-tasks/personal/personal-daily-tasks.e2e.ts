import { addTransactionToWallet } from './add-transaction-to-wallet';
import { addPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';
import { readPersonalEmails } from '../../../utils/notification';
import { verifyAccountBalance } from './verify-account-balances';
import WalletDashboardPage from '../../../pageobjects/wallet-dashboard-page';

describe('Personal daily tasks', () => {
  before(async () => {
    readPersonalEmails(false);

    const transactions = new Transactions();
    await transactions.initializeTransactions();
    const templateTransactions = transactions.getTemplateTransactions();
    console.log(`Template Transactions: ${JSON.stringify(templateTransactions, null, 4)}`);
    const paymentTransactions = transactions.getPaymentTransactions();
    console.log(`Payment Transactions: ${JSON.stringify(paymentTransactions, null, 4)}`);

    await WalletDashboardPage.open();

    if (templateTransactions.length) {
      await addTransactionToWallet(templateTransactions);
    }

    if (paymentTransactions.length) {
      await addPaymentsToWallet(paymentTransactions);
    }

    await verifyAccountBalance(transactions.getBalances(), await transactions.getBalanceSheet());
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
