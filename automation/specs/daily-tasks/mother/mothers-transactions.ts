import { format } from 'date-fns';
import { EXPENSE, INCOME, TRANSACTION_TYPE } from '../../../constants/mothers-transactions';
import { includesName } from '../../../utils/includes-name';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import { ExpectedTransaction, Transaction } from '../../../types/transaction';
import { DateTime } from 'luxon';
import { OVERALL_FORMULA } from '../../../utils/balance';

const { MOTHERS_WF = '', MOTHERS_CITI = '' } = process.env;

const INCLUDED_TRANSACTIONS = [MOTHERS_WF, MOTHERS_CITI];

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
    const transactions = await EmpowerTransactionPage.downloadTransactions();

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
        OVERALL_FORMULA,
      ],
    ];

    const allTransactions = this.outstandingExpenses
      .concat(this.outstandingIncome)
      .sort((a, b) => a.day - b.day);

    allTransactions.forEach((t) => {
      const amount = t.type === TRANSACTION_TYPE.INCOME ? t.amount : -t.amount;

      balanceSheet.push([
        t.identifier,
        format(today.setDate(t.day), 'P'),
        formatToDollars(amount),
        OVERALL_FORMULA,
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
    const transactionsForCurrentMonth = transactions
      .filter((t) => INCLUDED_TRANSACTIONS.some((it) => t.Account?.endsWith(it)))
      .filter((t) => {
        const transactionDate = DateTime.fromISO(t.Date);
        const isSameMonth = transactionDate.hasSame(DateTime.now(), 'month');

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
