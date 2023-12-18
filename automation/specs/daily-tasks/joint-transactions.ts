import * as csv from 'csvtojson';
import {
  format,
  getMonth,
} from 'date-fns';
import {
  TRANSACTION_HEADERS,
} from '../../constants/transaction';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';
import { Transaction } from '../../types/transaction';
import { BalanceSheet } from '../../constants/mothers-transactions';
import { formatFromDollars, formatToDollars } from '../../utils/currency-formatter';

const { JOINT_SOFI = '', JOINT_BILL = '', JOINT_FOOD = '' } = process.env;

// TODO: include pending income
// TODO: include pending bills
// TODO: update pending bills to come from google sheet
export class JointTransactions {
  private FOOD_BUDGET = 600;

  private transactionsForCurrentMonth: Transaction[];

  private balances: Record<string, string>;

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.loginToJoint();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.balances = await MintTransactionPage.getAllAccountBalances();
    console.log(`Balances: ${JSON.stringify(this.balances, null, 4)}`);
  }

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.balances[JOINT_SOFI]);
    const creditCardBalance = formatFromDollars(this.balances[JOINT_BILL]);
    const foodBalance = formatFromDollars(this.balances[JOINT_FOOD]);
    const today = new Date();

    const balanceSheet: BalanceSheet[] = [{
      name: 'Joint Account Balance',
      date: format(today, 'P'),
      amount: formatToDollars(checkingBalance),
      overall: formatToDollars(checkingBalance),
    }];

    let currentBalance = checkingBalance + creditCardBalance;
    balanceSheet.push({
      name: 'Credit Card Balance',
      date: format(today, 'P'),
      amount: formatToDollars(creditCardBalance),
      overall: formatToDollars(currentBalance),
    });

    currentBalance += foodBalance;
    balanceSheet.push({
      name: 'Current Food Balance',
      date: format(today, 'P'),
      amount: formatToDollars(foodBalance),
      overall: formatToDollars(currentBalance),
    });

    if (foodBalance < this.FOOD_BUDGET) {
      const outstandingFoodBalance = -(this.FOOD_BUDGET + foodBalance);
      currentBalance += outstandingFoodBalance;
      balanceSheet.push({
        name: 'Outstanding Food Balance',
        date: format(today, 'P'),
        amount: formatToDollars(outstandingFoodBalance),
        overall: formatToDollars(currentBalance),
      });
    }

    return balanceSheet;
  }

  private getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const isSameMonth = getMonth(transactionDate) === getMonth(new Date());

      if (isSameMonth) {
        return true;
      }

      return false;
    });

    transactionsForCurrentMonth.reverse();
    return transactionsForCurrentMonth;
  }

  getBalances() {
    return this.balances;
  }
}
