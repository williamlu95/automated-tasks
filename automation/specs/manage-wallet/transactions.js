/* eslint-disable no-console */
import csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import {
  WALLET_TRANSACTION,
  ACCOUNT_NAME,
  BILL,
  AUTO_PAY,
  AUTO_PAY_NAMES,
} from '../../constants/transaction';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';

const TRANSACTION_HEADERS = Object.freeze(['date', 'description', 'originalDescription', 'amount', 'type', 'category', 'account', 'labels', 'notes']);

export class Transactions {
  constructor() {
    this.generalTransactions = [];
    this.billTransactions = [];
    this.autoPayTransactions = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    const transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(transactionsForCurrentMonth, null, 4)}`);

    this.generalTransactions = transactionsForCurrentMonth
      .filter((t) => WALLET_TRANSACTION[t.account]?.isTransactionIncluded(t))
      .map((t) => ({ ...WALLET_TRANSACTION[t.account], amount: t.amount }));

    this.billTransactions = transactionsForCurrentMonth
      .reduce((billTransactions, t) => {
        const bill = Object.values(BILL).find((b) => this.#includesName(t.description, b.name));

        if (bill) {
          billTransactions.push({
            ...bill,
            amount: t.amount,
            description: t.description,
          });
        }

        return billTransactions;
      }, []);

    this.autoPayTransactions = transactionsForCurrentMonth
      .filter((t) => AUTO_PAY_NAMES
        .some((autoPayName) => this.#includesName(t.description, autoPayName)));

    this.balances = await MintTransactionPage.getAllAccountBalances();
  }

  #getTransactionsForCurrentMonth(transactions) {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const isSameMonth = getMonth(transactionDate) === global.transactionCounts.month;
      const isFromTransactionAccount = !!WALLET_TRANSACTION[t.account];
      const isTmobilePayment = this.#includesName(t.description, BILL.TMOBILE.name);

      if (isSameMonth && (isFromTransactionAccount || isTmobilePayment)) {
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

  getWalletTransactions() {
    return [
      ...this.getGeneralTransactions(),
      ...this.getBillTransactions(),
    ];
  }

  #getTransactionsForBank({ walletAccountName, transactionCountKey }) {
    const transactions = this.generalTransactions
      .filter((t) => t.walletAccountName === walletAccountName)
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += transactions.length;
    return transactions;
  }

  getGeneralTransactions() {
    return Object.values(WALLET_TRANSACTION)
      .flatMap((t) => this.#getTransactionsForBank(t));
  }

  #getTransactionsForBill({ name, transactionCountKey }) {
    const transactions = this.billTransactions
      .filter((t) => this.#includesName(t.description, name))
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += transactions.length;
    return transactions;
  }

  getBillTransactions() {
    return Object.values(BILL)
      .flatMap((t) => this.#getTransactionsForBill(t));
  }

  #includesName(description, name) {
    const normalizedDescription = description.replace(/\s/g, '').toLowerCase();
    const normalizedName = name.replace(/\s/g, '').toLowerCase();
    return normalizedDescription.includes(normalizedName);
  }

  #getPaymentForBank({ name, transfers, paymentCountKey }) {
    const allBankPayments = this.autoPayTransactions
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
