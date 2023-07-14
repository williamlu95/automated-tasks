/* eslint-disable no-console */
import csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import { WALLET_TRANSACTION, ACCOUNT_NAME } from '../../constants/account';
import { AUTO_PAY, AUTO_PAY_NAMES } from '../../constants/credit-card';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';

const TRANSACTION_HEADERS = Object.freeze(['date', 'description', 'originalDescription', 'amount', 'type', 'category', 'account', 'labels', 'notes']);

export class Transactions {
  constructor() {
    this.walletTransactions = [];
    this.paymentTransactions = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    const transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(transactionsForCurrentMonth, null, 4)}`);

    this.walletTransactions = transactionsForCurrentMonth
      .filter((t) => WALLET_TRANSACTION[t.account]?.isTransactionIncluded(t))
      .map((t) => ({ ...WALLET_TRANSACTION[t.account], amount: t.amount }));

    this.paymentTransactions = transactionsForCurrentMonth
      .filter((t) => AUTO_PAY_NAMES
        .some((autoPayName) => this.#includesName(t.description, autoPayName)));

    this.balances = await MintTransactionPage.getAllAccountBalances();
  }

  #getTransactionsForCurrentMonth(transactions) {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const isSameMonth = getMonth(transactionDate) === global.transactionCounts.month;
      const isFromTransactionAccount = !!WALLET_TRANSACTION[t.account];

      if (isSameMonth && isFromTransactionAccount) {
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

  #getTransactionsForBank({ name, transactionCountKey }) {
    const transactions = this.walletTransactions
      .filter((t) => t.name === name)
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += transactions.length;
    return transactions;
  }

  getWalletTransactions() {
    return Object.values(WALLET_TRANSACTION)
      .flatMap((t) => this.#getTransactionsForBank(t));
  }

  #includesName(description, name) {
    const normalizedDescription = description.replace(/\s/g, '').toLowerCase();
    const normalizedName = name.replace(/\s/g, '').toLowerCase();
    return normalizedDescription.includes(normalizedName);
  }

  #getPaymentForBank({ name, transfers, paymentCountKey }) {
    const allBankPayments = this.paymentTransactions
      .filter((t) => this.#includesName(t.description, name))
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

  getPaymentTransactions() {
    return Object.values(AUTO_PAY)
      .flatMap((p) => this.#getPaymentForBank(p));
  }

  getBalances() {
    return this.balances;
  }
}
