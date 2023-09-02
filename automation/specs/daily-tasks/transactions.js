/* eslint-disable no-console */
import csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import { TEMPLATE_TRANSACTION, ACCOUNT_NAME, AUTO_PAY } from '../../constants/transaction';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';

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
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += transactions.length;
    return transactions.map((t) => ({ ...restOfTemplate, amount: t.amount }));
  }

  #getTransactionsForCurrentMonth(transactions) {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const isSameMonth = getMonth(transactionDate) === global.transactionCounts.month;

      if (isSameMonth) {
        return true;
      }

      const lastMonth = new Date(new Date().getFullYear(), global.transactionCounts.month - 1);
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
      .slice(global.transactionCounts[paymentCountKey]);

    global.transactionCounts[paymentCountKey] += newBankPayments.length;
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
