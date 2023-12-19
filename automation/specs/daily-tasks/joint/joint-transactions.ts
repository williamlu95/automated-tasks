import * as csv from 'csvtojson';
import { format, getMonth } from 'date-fns';
import { TRANSACTION_HEADERS } from '../../../constants/transaction';
import MintLoginPage from '../../../pageobjects/mint-login-page';
import MintTransactionPage from '../../../pageobjects/mint-transaction-page';
import { BalanceSheet, ExpectedTransaction, Transaction } from '../../../types/transaction';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import { EXPENSE, INCOME, TRANSACTION_TYPE } from '../../../constants/joint-transactions';
import { includesName } from '../../../utils/includes-name';

const { JOINT_SOFI = '', JOINT_BILL = '', JOINT_FOOD = '' } = process.env;

export class JointTransactions {
  private FOOD_BUDGET = 600;

  private transactionsForCurrentMonth: Transaction[];

  private outstandingExpenses: ExpectedTransaction[];

  private outstandingIncome: ExpectedTransaction[];

  private balances: Record<string, string>;

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.loginToJoint();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses();
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);

    this.balances = await MintTransactionPage.getAllAccountBalances();
    console.log(`Balances: ${JSON.stringify(this.balances, null, 4)}`);
  }

  private calculateOutstandingIncome(): ExpectedTransaction[] {
    const income: ExpectedTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter((t) =>
        includesName(t.description, value.name)
      );

      const unpaidSalary = (value.days?.slice(paidSalary.length) || []).map((day) => ({
        ...value,
        day,
      }));

      income.push(...unpaidSalary);
    });

    return income.sort((a, b) => a.day - b.day);
  }

  private calculateOutstandingExpenses(): ExpectedTransaction[] {
    const expenses: ExpectedTransaction[] = [];

    Object.values(EXPENSE).forEach((e) => {
      if (
        this.transactionsForCurrentMonth.some(
          (t) =>
            includesName(t.description, e.name) &&
            (!e.validateTransaction || e.validateTransaction(t))
        )
      ) {
        return;
      }

      expenses.push(e);
    });

    return expenses.sort((a, b) => a.day - b.day);
  }

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.balances[JOINT_SOFI]);
    const creditCardBalance = formatFromDollars(this.balances[JOINT_BILL]);
    const foodBalance = formatFromDollars(this.balances[JOINT_FOOD]);
    const today = new Date();

    const balanceSheet: BalanceSheet[] = [
      {
        name: 'Joint Account Balance',
        date: format(today, 'P'),
        amount: formatToDollars(checkingBalance),
        overall: formatToDollars(checkingBalance),
      },
    ];

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

    const allTransactions = this.outstandingExpenses
      .concat(this.outstandingIncome)
      .sort((a, b) => a.day - b.day);

    allTransactions.forEach((t) => {
      const amount = t.type === TRANSACTION_TYPE.INCOME ? t.amount : -t.amount;

      currentBalance += amount;

      balanceSheet.push({
        name: t.identifier,
        date: format(today.setDate(t.day), 'P'),
        amount: formatToDollars(amount),
        overall: formatToDollars(currentBalance),
      });
    });

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
