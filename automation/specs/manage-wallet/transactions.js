/* eslint-disable no-console */
import csv from 'csvtojson';
import {
  endOfMonth,
  getMonth,
  isSameDay,
} from 'date-fns';
import {
  ACCOUNT_NAME, WALLET_ACCOUNT, CREDIT_CARD_NAME,
} from '../../constants/account';
import {
  AUTO_PAY,
  AUTO_PAY_NAMES,
  AUTO_PAY_NAME,
  PAYMENT_COUNT_KEY,
} from '../../constants/credit-card';
import { INCOME_NAME } from '../../constants/income';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';

const TRANSACTION_HEADERS = Object.freeze(['date', 'description', 'originalDescription', 'amount', 'type', 'category', 'account', 'labels', 'notes']);

export const TRANSACTION_COUNT_KEY = Object.freeze({
  [WALLET_ACCOUNT.CHASE_CHECKING]: 'chaseIncome',
  [WALLET_ACCOUNT.WELLS_FARGO_CHECKING]: 'wellsFargoIncome',
  [WALLET_ACCOUNT.CITI_DOUBLE_CASH]: 'citiDoubleExpense',
});

export class Transactions {
  constructor() {
    this.incomeTransactions = [];
    this.paymentTransactions = [];
    this.creditTransactions = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    const transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(transactionsForCurrentMonth, null, 4)}`);

    this.incomeTransactions = transactionsForCurrentMonth
      .filter((t) => t.description.includes(INCOME_NAME))
      .map((t) => ({ amount: t.amount, type: ACCOUNT_NAME[t.account] }));

    this.creditTransactions = transactionsForCurrentMonth
      .filter((t) => CREDIT_CARD_NAME.CITI_DOUBLE === t.account)
      .map((t) => ({ amount: t.amount, type: ACCOUNT_NAME[t.account] }));

    this.paymentTransactions = transactionsForCurrentMonth
      .filter((t) => AUTO_PAY_NAMES
        .some((autoPayName) => this.#includesName(t.description, autoPayName)));

    this.balances = await MintTransactionPage.getAllAccountBalances();
  }

  #getTransactionsForCurrentMonth(transactions) {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const isSameMonth = getMonth(transactionDate) === global.transactionCounts.month;
      const isFromTransactionAccount = !!ACCOUNT_NAME[t.account];

      if (isSameMonth && isFromTransactionAccount) {
        return true;
      }

      const lastMonth = new Date(new Date().getFullYear(), global.transactionCounts.month - 1);
      const isLastDayOfLastMonth = isSameDay(transactionDate, endOfMonth(lastMonth));
      const isWellsFargoCheckingAccount = t.account === 'Wells Fargo College Checking®';

      if (isLastDayOfLastMonth && isWellsFargoCheckingAccount) {
        return true;
      }

      return false;
    });

    transactionsForCurrentMonth.reverse();
    return transactionsForCurrentMonth;
  }

  #getTransactionsForBank(bankName) {
    const transactionCountKey = TRANSACTION_COUNT_KEY[bankName];

    if (!transactionCountKey) {
      console.error(`No such transaction count with bank name ${bankName}`);
      return [];
    }

    const transactions = this.incomeTransactions.concat(this.creditTransactions)
      .filter((t) => t.type === bankName)
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += transactions.length;
    return transactions;
  }

  getWalletTransactions() {
    return Object.keys(TRANSACTION_COUNT_KEY)
      .flatMap((key) => this.#getTransactionsForBank(key));
  }

  #includesName(description, name) {
    const normalizedDescription = description.replace(/\s/g, '').toLowerCase();
    const normalizedName = name.replace(/\s/g, '').toLowerCase();
    return normalizedDescription.includes(normalizedName);
  }

  #getPaymentForBank(bankName) {
    const autoPayName = AUTO_PAY_NAME[bankName];
    const autoPays = AUTO_PAY[bankName];
    const transactionCountKey = PAYMENT_COUNT_KEY[bankName];

    if (!autoPayName || !autoPays || !transactionCountKey) {
      console.error(`No such auto pay with bank name ${bankName}`);
      return [];
    }

    const allBankPayments = this.paymentTransactions
      .filter((t) => this.#includesName(t.description, autoPayName))
      .map((t, i) => (autoPays[i]
        ? ({ fromAccount: autoPays[i].from, toAccount: autoPays[i].to, amount: t.amount })
        : null
      ));

    const newBankPayments = allBankPayments
      .filter((p) => p)
      .slice(global.transactionCounts[transactionCountKey]);

    global.transactionCounts[transactionCountKey] += newBankPayments.length;
    return newBankPayments;
  }

  getPaymentTransactions() {
    return Object.keys(AUTO_PAY_NAME)
      .flatMap((key) => this.#getPaymentForBank(key));
  }

  getBalances() {
    return this.balances;
  }
}
