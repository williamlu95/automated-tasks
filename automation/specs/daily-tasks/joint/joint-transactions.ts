import { addMonths, format } from 'date-fns';
import { ExpectedJointTransaction, Transaction } from '../../../types/transaction';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import { EXPENSE, INCOME, TRANSACTION_TYPE } from '../../../constants/joint-transactions';
import { includesName } from '../../../utils/includes-name';
import { ADDITIONAL_MONTHS } from '../../../utils/date-formatters';
import EmpowerLoginPage from '../../../pageobjects/empower-login-page';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import { DateTime } from 'luxon';

const { JOINT_SOFI = '', JOINT_BILL = '', JOINT_FOOD = '' } = process.env;

const OVERALL_FORMULA = '=INDIRECT("C" & ROW()) + INDIRECT("D" & ROW() - 1)';

export class JointTransactions {
  private FOOD_BUDGET = 600;

  private transactionsForCurrentMonth: Transaction[];

  private outstandingExpenses: ExpectedJointTransaction[];

  private outstandingIncome: ExpectedJointTransaction[];

  private balances: Record<string, string>;

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
    this.balances = {};
  }

  async initializeTransactions() {
    await EmpowerLoginPage.open();
    await EmpowerLoginPage.loginToJoint();
    await EmpowerTransactionPage.open();
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

  private calculateOutstandingIncome(): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter((t) =>
        includesName(t.Description, value.name)
      );

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
      if (
        this.transactionsForCurrentMonth.some(
          (t) =>
            includesName(t.Description, e.name) &&
            (!e.validateTransaction || e.validateTransaction(t))
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
    const futureDates = Array(ADDITIONAL_MONTHS)
      .fill(new Date())
      .map((date, index) => addMonths(date, index + 1));

    return futureDates.flatMap((futureDate) =>
      [
        {
          identifier: 'Food Budget',
          name: '',
          amount: this.FOOD_BUDGET,
          day: format(new Date(futureDate).setDate(1), 'P'),
          type: TRANSACTION_TYPE.EXPENSE,
        },
      ].concat(
        Object.values(EXPENSE).map((e) => ({
          ...e,
          day: format(new Date(futureDate).setDate(e.day), 'P'),
          days: undefined,
        }))
      )
    );
  }

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.balances[JOINT_SOFI]);
    const creditCardBalance = -formatFromDollars(this.balances[JOINT_BILL]);
    const foodBalance = -formatFromDollars(this.balances[JOINT_FOOD]);
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
      'Credit Card Balance',
      format(today, 'P'),
      formatToDollars(creditCardBalance),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Current Food Balance',
      format(today, 'P'),
      formatToDollars(foodBalance),
      OVERALL_FORMULA,
    ]);

    const outstandingFoodBalance = -(this.FOOD_BUDGET + foodBalance);
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
    const transactionsForCurrentMonth = transactions.filter((t) => {
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
