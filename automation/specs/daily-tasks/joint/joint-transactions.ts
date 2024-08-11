import { format } from 'date-fns';
import { DateTime } from 'luxon';
import { ExpectedJointTransaction, Transaction } from '../../../types/transaction';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import {
  EXPENSE,
  FOOD_BUDGET,
  INCOME,
  TRANSACTION_TYPE,
  generateExpenseForDate,
} from '../../../constants/joint-transactions';
import { includesName } from '../../../utils/includes-name';
import { ADDITIONAL_MONTHS } from '../../../utils/date-formatters';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import WalletDashboardPage from '../../../pageobjects/wallet-dashboard-page';
import { OVERALL_FORMULA } from '../../../utils/balance';
import { WALLET_ACCOUNT } from '../../../constants/personal-transactions';

const {
  JOINT_SOFI = '', JOINT_FOOD = '', JOINT_MISC = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [JOINT_SOFI, JOINT_FOOD, JOINT_MISC];

export class JointTransactions {
  private transactionsForCurrentMonth: Transaction[];

  private outstandingExpenses: ExpectedJointTransaction[];

  private outstandingIncome: ExpectedJointTransaction[];

  private actualBalances: Record<string, string>;

  private expectedBalances: Record<string, string>;

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
    this.actualBalances = {};
    this.expectedBalances = {};
  }

  async initializeTransactions() {
    const transactions = await EmpowerTransactionPage.downloadTransactions();

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses();
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);

    this.actualBalances = await EmpowerTransactionPage.getAllAccountBalances();
    console.log(`Actual Balances: ${JSON.stringify(this.actualBalances, null, 4)}`);

    this.expectedBalances = await WalletDashboardPage.loginAndGetAllAccountBalances();
    console.log(`Expected Balances: ${JSON.stringify(this.expectedBalances, null, 4)}`);
  }

  private calculateOutstandingIncome(): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter((t) => includesName(t.Description, value.name));

      const unpaidSalary = (value.days?.slice(paidSalary.length) || []).map((day) => ({
        ...value,
        day,
      }));

      income.push(...unpaidSalary);
    });

    return income.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }

  private calculateOutstandingExpenses(): ExpectedJointTransaction[] {
    const expenses: ExpectedJointTransaction[] = [];

    Object.values(EXPENSE).forEach((e) => {
      // TODO: Remove after August 2024
      if (e.name === 'Tundra' && format(new Date().setDate(e.day), 'P') === '8/11/2024') {
        return;
      }

      if (
        this.transactionsForCurrentMonth.some(
          (t) => includesName(t.Description, e.name)
            && (!e.validateTransaction || e.validateTransaction(t)),
        )
      ) {
        return;
      }

      expenses.push({ ...e, day: format(new Date().setDate(e.day), 'P'), days: undefined });
    });
    expenses.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    const futureExpenses = this.calculateFutureExpenses();

    return expenses.concat(futureExpenses);
  }

  private calculateFutureExpenses(): ExpectedJointTransaction[] {
    const futureDates: DateTime[] = Array(ADDITIONAL_MONTHS)
      .fill(DateTime.now())
      .map((date, index) => date.plus({ months: index + 1 }));

    return futureDates.flatMap((futureDate) => [
      {
        identifier: 'Food Budget',
        name: '',
        amount: FOOD_BUDGET,
        day: format(futureDate.toJSDate().setDate(1), 'P'),
        type: TRANSACTION_TYPE.EXPENSE,
      },
    ].concat(
      Object.values(generateExpenseForDate(futureDate)).map((e) => ({
        ...e,
        day: format(futureDate.toJSDate().setDate(e.day), 'P'),
        days: undefined,
      })),
    ));
  }

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.actualBalances[JOINT_SOFI]);
    const foodBalance = formatFromDollars(this.expectedBalances[WALLET_ACCOUNT.AMEX_GOLD]);
    const miscBalance = formatFromDollars(this.expectedBalances[WALLET_ACCOUNT.MARRIOTT_BOUNDLESS]);
    const today = new Date();

    const balanceSheet: string[][] = [
      [
        'Joint Account Balance',
        format(today, 'P'),
        formatToDollars(checkingBalance),
        formatToDollars(checkingBalance),
      ],
    ];

    balanceSheet.push([
      'Misc Balance (Marriott Boundless)',
      format(today, 'P'),
      formatToDollars(miscBalance),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Current Food Balance (AMEX Gold)',
      format(today, 'P'),
      formatToDollars(foodBalance),
      OVERALL_FORMULA,
    ]);

    const outstandingFoodBalance = -(FOOD_BUDGET + foodBalance);
    if (outstandingFoodBalance < 0) {
      balanceSheet.push([
        'Outstanding Food Balance',
        format(today, 'P'),
        formatToDollars(outstandingFoodBalance),
        OVERALL_FORMULA,
      ]);
    }


    const allTransactions = this.outstandingExpenses
      .concat(this.outstandingIncome)
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

    allTransactions.forEach((t) => {
      const amount = t.type === TRANSACTION_TYPE.INCOME ? t.amount : -t.amount;

      balanceSheet.push([t.identifier, t.day, formatToDollars(amount), OVERALL_FORMULA]);
    });

    return balanceSheet;
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

  getActualBalances() {
    return this.actualBalances;
  }

  getExpectedBalances() {
    return this.expectedBalances;
  }
}
