import { format } from 'date-fns';
import { DateTime } from 'luxon';
import { ExpectedJointTransaction, ExpectedTransaction } from '../../../types/transaction';
import { formatToDollars } from '../../../utils/currency-formatter';
import {
  CREDIT_CARD_BILL,
  EXPENSE,
  FOOD_BUDGET,
  INCOME,
  TRANSACTION_TYPE,
  generateExpenseForDate,
} from '../../../constants/joint-transactions';
import { ADDITIONAL_MONTHS } from '../../../utils/date-formatters';
import { OVERALL_FORMULA } from '../../../utils/balance';
import { WALLET_ACCOUNT } from '../../../constants/personal-transactions';
import { BaseTransactions } from '../../../utils/base-transaction';
import { DailyTaskData } from '../daily-task-data';

const {
  JOINT_SOFI = '',
  JOINT_FOOD = '',
  JOINT_BILL = '',
  JOINT_MISC = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [
  JOINT_SOFI,
  JOINT_FOOD,
  JOINT_BILL,
  JOINT_MISC,
];

export class JointTransactions extends BaseTransactions {
  private actualBalances: Record<string, string>;

  private expectedBalances: Record<string, string>;

  private grocerySpend: number;

  constructor() {
    super(INCLUDED_TRANSACTIONS);
    this.actualBalances = {};
    this.expectedBalances = {};
    this.grocerySpend = 0;
  }

  initializeTransactions() {
    const transactions = DailyTaskData.getTransactions();

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses(EXPENSE).filter(this.filterExpenses);
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome(INCOME);
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);

    this.actualBalances = DailyTaskData.getActualBalances();
    console.log(`Actual Balances: ${JSON.stringify(this.actualBalances, null, 4)}`);

    this.expectedBalances = DailyTaskData.getExpectedBalances();
    console.log(`Expected Balances: ${JSON.stringify(this.expectedBalances, null, 4)}`);

    this.grocerySpend = DailyTaskData.getJointGrocerySpend();
    console.log('Grocery Spend: ', this.grocerySpend);
  }

  private filterExpenses = (e: ExpectedJointTransaction) => !(['05/09/2025', '06/09/2025', '07/09/2025', '08/09/2025', '09/09/2025', '10/09/2025'].includes(e.day) && e.name === CREDIT_CARD_BILL.CAR_INSURANCE_BILL);

  protected calculateOutstandingExpenses(expenseTemplate: Record<string, ExpectedTransaction>): ExpectedJointTransaction[] {
    const expenseMaxes = new Map<string, number[]>();

    const expenses = super.calculateOutstandingExpenses(expenseTemplate);

    expenses.forEach((expense) => {
      const maxes = expenseMaxes.get(expense.identifier) || [0];
      const max = maxes[maxes.length - 1];

      if (expense.amount > max) {
        maxes[maxes.length - 1] = expense.amount;
      } else {
        maxes.push(expense.amount);
      }

      expenseMaxes.set(expense.identifier, maxes);
    });

    return expenses.filter((expense) => {
      const maxes = expenseMaxes.get(expense.identifier) || [];
      const [max] = maxes;

      if (expense.amount < max) {
        return false;
      }

      expenseMaxes.set(expense.identifier, maxes.slice(1));
      return true;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected calculateFutureExpenses(_expenseTemplate: Record<string, ExpectedTransaction>): ExpectedJointTransaction[] {
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

  private getInitialBalanceSheet() {
    const today = new Date();
    return [
      ['Joint Account Balance', this.actualBalances[JOINT_SOFI]],
      ['Pending Transactions', this.expectedBalances['Pending Transactions']],
      ['Bill Balance (Marriott Bold)', this.actualBalances[JOINT_BILL]],
      ['Misc Balance (Venture X)', this.expectedBalances[WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]],
      ['Current Food Balance (AMEX Gold)', this.expectedBalances[WALLET_ACCOUNT.AMEX_GOLD]],
    ].map(([name, balance], index) => [name,
      format(today, 'P'),
      balance,
      index === 0 ? balance : OVERALL_FORMULA]);
  }

  getBalanceSheet() {
    const today = new Date();
    const balanceSheet = this.getInitialBalanceSheet();

    const outstandingFoodBalance = -(FOOD_BUDGET + this.grocerySpend);
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

  getActualBalances() {
    return this.actualBalances;
  }

  getExpectedBalances() {
    return this.expectedBalances;
  }
}
