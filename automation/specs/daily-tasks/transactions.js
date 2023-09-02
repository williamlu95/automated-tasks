import * as csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import { TEMPLATE_TRANSACTION, ACCOUNT_NAME, AUTO_PAY } from '../../constants/transaction';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';
import { TransactionCounts } from '../../utils/transaction-counts';

const TRANSACTION_HEADERS = Object.freeze(['date', 'description', 'originalDescription', 'amount', 'type', 'category', 'account', 'labels', 'notes']);

export class Transactions {
  constructor() {
    this.transactionsForCurrentMonth = [];
    this.templateTransactions = [];
    this.autoPayTransactions = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION)
      .flatMap((t) => this.#getTransactionsForTemplate(t));

    this.autoPayTransactions = Object.values(AUTO_PAY)
      .flatMap((p) => this.#getTransactionsForAutoPay(p));

    this.balances = await MintTransactionPage.getAllAccountBalances();
  }

  #getTransactionsForTemplate({ isTransactionIncluded, transactionCountKey, ...restOfTemplate }) {
    const transactions = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .slice(TransactionCounts.getTransactionCount(transactionCountKey));

    TransactionCounts.addToTransactionCount(transactions.lengthm, transactionCountKey);
    return transactions.map((t) => ({ ...restOfTemplate, amount: t.amount }));
  }

  #getTransactionsForCurrentMonth(transactions) {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const currentMonth = TransactionCounts.getTransactionMonth();
      const isSameMonth = getMonth(transactionDate) === currentMonth;

      if (isSameMonth) {
        return true;
      }

      const lastMonth = new Date(new Date().getFullYear(), currentMonth - 1);
      const isLastDayOfLastMonth = isSameDay(transactionDate, endOfMonth(lastMonth));
      const isWellsFargoCheckingAccount = t.account === ACCOUNT_NAME.WELLS_FARGO;

      if (isLastDayOfLastMonth && isWellsFargoCheckingAccount) {
        return true;
      }

      return false;
    });

    transactionsForCurrentMonth.reverse();
    return transactionsForCurrentMonth;
  }

  #getTransactionsForAutoPay({ isTransactionIncluded, transfers, paymentCountKey }) {
    const allBankPayments = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .map((t, i) => (transfers[i]
        ? ({ fromAccount: transfers[i].from, toAccount: transfers[i].to, amount: t.amount })
        : null
      ));

    const newBankPayments = allBankPayments
      .filter((p) => p)
      .slice(TransactionCounts.getTransactionCount(paymentCountKey));

    TransactionCounts.addToTransactionCount(newBankPayments.length, paymentCountKey);
    return newBankPayments;
  }

  getTemplateTransactions() {
    return this.templateTransactions;
  }

  getPaymentTransactions() {
    return this.autoPayTransactions;
  }

  getBalances() {
    return this.balances;
  }
}
