import { DateTime } from 'luxon';
import { format } from 'date-fns';
import {
  AUTO_PAY,
  EXPENSE,
  INCOME,
  TEMPLATE_TRANSACTION,
  TRANSACTION_TYPE,
  WALLET_ACCOUNT,
} from '../../../constants/personal-transactions';
import {
  Transaction,
  TemplateTransaction,
  AutoPayTransaction,
  ExpectedJointTransaction,
} from '../../../types/transaction';
import { includesName } from '../../../utils/includes-name';
import { formatToDollars } from '../../../utils/currency-formatter';
import { OVERALL_FORMULA } from '../../../utils/balance';
import { BaseTransactions } from '../../../utils/base-transaction';
import { DailyTaskData } from '../daily-task-data';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CITI_DOUBLE_CASH = '',
  CITI_PREMIER = '',
  DISCOVER_IT = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  CHASE_SAPPHIRE_PREFERRED = '',
  CHASE_FREEDOM_UNLIMITED = '',
  WELLS_FARGO_CHECKING = '',
  WELLS_FARGO_ACTIVE_CASH = '',
  WELLS_FARGO_PLATINUM = '',
  AMEX_BLUE = '',
  WELLS_FARGO_AUTOGRAPH = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [
  CHASE_CHECKING,
  CAPITAL_ONE_VENTURE_X,
  CITI_CUSTOM_CASH,
  CITI_DOUBLE_CASH,
  CITI_PREMIER,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
  CHASE_SAPPHIRE_PREFERRED,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_ACTIVE_CASH,
  WELLS_FARGO_PLATINUM,
  AMEX_BLUE,
  WELLS_FARGO_AUTOGRAPH,
];

export type Template = Omit<
  Omit<TemplateTransaction, 'isTransactionIncluded'>,
  'transactionCountKey'
> & { amount: string };
export type AutoPay = { fromAccount: string; toAccount: string; amount: string };

export class PersonalTransactions extends BaseTransactions {
  private transactionCounts: Record<string, number>;

  private templateTransactions: Template[];

  private autoPayTransactions: AutoPay[];

  private balances: Record<string, string>;

  constructor() {
    super(INCLUDED_TRANSACTIONS);
    this.transactionCounts = {};
    this.templateTransactions = [];
    this.autoPayTransactions = [];
    this.balances = {};
  }

  initializeTransactions() {
    this.transactionCounts = DailyTaskData.getTransactionCounts();

    const transactions = DailyTaskData.getTransactions();
    this.balances = DailyTaskData.getActualBalances();

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION).flatMap((t) => this.getTransactionsForTemplate(t));

    this.autoPayTransactions = Object.values(AUTO_PAY).flatMap((p) => this.getTransactionsForAutoPay(p));
    console.log(`AutoPay Transactions: ${JSON.stringify(this.autoPayTransactions, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses(EXPENSE).filter(this.filterExpenses);
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);
  }

  private filterExpenses = (e: ExpectedJointTransaction) => !(['08/14/2025'].includes(e.day) && e.name === EXPENSE.FLEX_LOAN.name);

  protected calculateOutstandingIncome(): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter(
        (t) => includesName(t.description, value.name)
          && t.account?.endsWith(WELLS_FARGO_CHECKING)
          && DateTime.fromISO(t.date).hasSame(DateTime.now(), 'month'),
      );

      const unpaidSalary = (value.days?.slice(paidSalary.length) || []).map((day) => ({
        ...value,
        day,
      }));

      income.push(...unpaidSalary);
    });

    return income.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }

  private getTransactionsForTemplate({
    isTransactionIncluded,
    transactionCountKey,
    ...restOfTemplate
  }: TemplateTransaction): Template[] {
    const transactions = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .slice(this.transactionCounts[transactionCountKey]);

    return transactions.map((t) => ({
      ...restOfTemplate,
      amount: t.amount,
    }));
  }

  protected getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions
      .filter((t) => INCLUDED_TRANSACTIONS.some((it) => t.account?.endsWith(it)))
      .filter((t) => {
        const transactionDate = DateTime.fromISO(t.date);
        const isSameMonth = transactionDate.hasSame(DateTime.now(), 'month');

        if (isSameMonth) {
          return true;
        }

        const lastDayOfLastMonth = DateTime.now().minus({ month: 1 }).endOf('month');
        const isLastDayOfLastMonth = transactionDate.hasSame(lastDayOfLastMonth, 'day');

        if (isLastDayOfLastMonth) {
          return true;
        }

        return false;
      });

    transactionsForCurrentMonth.reverse();
    return transactionsForCurrentMonth;
  }

  private getTransactionsForAutoPay({
    isTransactionIncluded,
    transfers,
    paymentCountKey,
  }: AutoPayTransaction): AutoPay[] {
    const allBankPayments = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .map((t, i) => {
        if (!transfers(i)) return null;

        return {
          fromAccount: WALLET_ACCOUNT.CHASE_CHECKING as string,
          toAccount: transfers(i),
          amount: t.amount,
        };
      });

    const newBankPayments: AutoPay[] = allBankPayments
      .filter((p): p is AutoPay => p !== null)
      .slice(this.transactionCounts[paymentCountKey]);

    return newBankPayments;
  }

  getTemplateTransactions() {
    return this.templateTransactions;
  }

  getPaymentTransactions() {
    return this.autoPayTransactions;
  }

  getBalances() {
    return this.balances;
  }

  private getInitialBalanceSheet() {
    const today = new Date();
    return [
      ['WF Checking Balance', this.balances[WELLS_FARGO_CHECKING]],
      ['WF Autograph Balance', this.balances[WELLS_FARGO_AUTOGRAPH]],
      ['Amex Blue Balance', this.balances[AMEX_BLUE]],
      ['Chase Freedom Unlimited', this.balances[CHASE_FREEDOM_UNLIMITED]],
    ].map(([name, balance], index) => [name,
      format(today, 'P'),
      balance,
      index === 0 ? balance : OVERALL_FORMULA]);
  }

  getBalanceSheet() {
    const balanceSheet = this.getInitialBalanceSheet();

    const allTransactions = this.outstandingExpenses
      .concat(this.outstandingIncome)
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

    allTransactions.forEach((t) => {
      const amount = t.type === TRANSACTION_TYPE.CREDIT ? t.amount : -t.amount;
      balanceSheet.push([t.identifier, t.day, formatToDollars(amount), OVERALL_FORMULA]);
    });

    return balanceSheet;
  }
}
