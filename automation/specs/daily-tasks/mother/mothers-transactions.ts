import * as csv from 'csvtojson';
import { format, getMonth } from 'date-fns';
import { EXPENSE, INCOME, TRANSACTION_TYPE } from '../../../constants/mothers-transactions';
import { includesName } from '../../../utils/includes-name';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import EmpowerLoginPage from '../../../pageobjects/empower-login-page';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import { ExpectedTransaction, Transaction } from '../../../types/transaction';
import { TRANSACTION_HEADERS } from '../../../constants/transaction';

const { MOTHERS_WF = '', MOTHERS_CITI = '' } = process.env;

export class MothersTransactions {
  private transactionsForCurrentMonth: Transaction[];

  private outstandingIncome: ExpectedTransaction[];

  private outstandingExpenses: ExpectedTransaction[];

  private balances: Record<string, string>;

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await EmpowerLoginPage.open();
    await EmpowerLoginPage.loginToMother();
    await EmpowerTransactionPage.open();
    const transactionsPath = await EmpowerTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses();
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);

    this.balances = await EmpowerTransactionPage.getAllAccountBalances();
    console.log(`Balances: ${JSON.stringify(this.balances, null, 4)}`);
  }

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.balances[MOTHERS_WF]);
    const creditCardBalance = formatFromDollars(this.balances[MOTHERS_CITI]);
    let currentBalance = checkingBalance + creditCardBalance;
    const today = new Date();

    const balanceSheet: string[][] = [
      [
        'Checking Account Balance',
        format(today, 'P'),
        formatToDollars(checkingBalance),
        formatToDollars(checkingBalance),
      ],
      [
        'Credit Card Balance',
        format(today, 'P'),
        formatToDollars(creditCardBalance),
        formatToDollars(currentBalance),
      ],
    ];

    const allTransactions = this.outstandingExpenses
      .concat(this.outstandingIncome)
      .sort((a, b) => a.day - b.day);

    allTransactions.forEach((t) => {
      const amount = t.type === TRANSACTION_TYPE.INCOME ? t.amount : -t.amount;

      currentBalance += amount;

      balanceSheet.push([
        t.identifier,
        format(today.setDate(t.day), 'P'),
        formatToDollars(amount),
        formatToDollars(currentBalance),
      ]);
    });

    return balanceSheet;
  }

  private calculateOutstandingExpenses(): ExpectedTransaction[] {
    const expenses: ExpectedTransaction[] = [];

    Object.values(EXPENSE).forEach((e) => {
      if (this.transactionsForCurrentMonth.every((t) => !includesName(t.Description, e.name))) {
        expenses.push(e);
      }
    });

    return expenses.sort((a, b) => a.day - b.day);
  }

  private calculateOutstandingIncome(): ExpectedTransaction[] {
    const income: ExpectedTransaction[] = [];

    Object.entries(INCOME).forEach(([key, value]) => {
      switch (key) {
        case 'MOTHER_SALARY':
          const paidSalary = this.transactionsForCurrentMonth.filter((t) =>
            includesName(t.Description, value.name)
          );

          const unpaidSalary = (value.days?.slice(paidSalary.length) || []).map((day) => ({
            ...value,
            day,
          }));

          income.push(...unpaidSalary);
          break;

        default:
          if (
            this.transactionsForCurrentMonth.every((t) => !includesName(t.Description, value.name))
          ) {
            income.push(value);
          }
      }
    });

    return income.sort((a, b) => a.day - b.day);
  }

  private getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.Date);
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
