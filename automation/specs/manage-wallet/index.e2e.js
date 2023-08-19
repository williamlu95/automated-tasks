import LoginPage from '../../pageobjects/wallet-login-page';
import { runAddTransactionToWallet } from './add-transaction-to-wallet';
import { runAddPaymentsToWallet } from './add-payments-to-wallet';
import { Transactions } from './transactions';
import { runVerifyAccountBalances } from './verify-account-balances';
import { payTmobileBill } from './pay-tmobile-bill';
import { readEmails } from '../../utils/notification';

describe('Manage finances in wallet app', () => {
  before(async () => {
    readEmails(false);

    const templateTransactions = await payTmobileBill();
    const transactions = new Transactions();
    await transactions.initializeTransactions();
    templateTransactions.push(...transactions.getTemplateTransactions());
    console.log(`Template Transactions: ${JSON.stringify(this.templateTransactions, null, 4)}`);
    const paymentTransactions = transactions.getPaymentTransactions();
    console.log(`Payment Transactions: ${JSON.stringify(this.paymentTransactions, null, 4)}`);

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
