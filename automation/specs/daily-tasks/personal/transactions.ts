import { TransactionCounts } from '../../../utils/transaction-counts';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import {
  AUTO_PAY,
  EXPENSE,
  INCOME,
  TEMPLATE_TRANSACTION,
  TRANSACTION_TYPE,
  getFromAccount,
} from '../../../constants/personal-transactions';
import {
  Transaction,
  TemplateTransaction,
  AutoPayTransaction,
  ExpectedJointTransaction,
} from '../../../types/transaction';
import { DateTime } from 'luxon';
import { includesName } from '../../../utils/includes-name';
import { addMonths, format } from 'date-fns';
import { ADDITIONAL_MONTHS } from '../../../utils/date-formatters';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import { OVERALL_FORMULA } from '../../../utils/balance';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  DISCOVER_IT = '',
  CHASE_AMAZON = '',
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
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
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

export class Transactions {
  private transactionsForCurrentMonth: Transaction[];

  private templateTransactions: Template[];

  private autoPayTransactions: AutoPay[];

  private balances: Record<string, string>;

  private outstandingExpenses: ExpectedJointTransaction[];

  private outstandingIncome: ExpectedJointTransaction[];

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.templateTransactions = [];
    this.autoPayTransactions = [];
    this.balances = {};
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
  }

  async initializeTransactions() {
    const transactions = await EmpowerTransactionPage.downloadTransactions();
    this.balances = await EmpowerTransactionPage.getAllAccountBalances();

    this.transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION).flatMap((t) =>
      this.#getTransactionsForTemplate(t)
    );

    this.autoPayTransactions = Object.values(AUTO_PAY).flatMap((p) =>
      this.#getTransactionsForAutoPay(p)
    );

    this.outstandingExpenses = this.calculateOutstandingExpenses();
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);
  }

  private calculateOutstandingIncome(): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter(
        (t) =>
          includesName(t.Description, value.name) &&
          t.Account?.endsWith(WELLS_FARGO_CHECKING) &&
          DateTime.fromISO(t.Date).hasSame(DateTime.now(), 'month')
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
      Object.values(EXPENSE).map((e) => ({
        ...e,
        day: format(new Date(futureDate).setDate(e.day), 'P'),
        days: undefined,
      }))
    );
  }

  #getTransactionsForTemplate({
    isTransactionIncluded,
    transactionCountKey,
    ...restOfTemplate
  }: TemplateTransaction): Template[] {
    const transactions = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .slice(TransactionCounts.getTransactionCount(transactionCountKey));

    TransactionCounts.addToTransactionCount(transactions.length, transactionCountKey);
    return transactions.map((t) => ({
      ...restOfTemplate,
      amount: t.Amount,
    }));
  }

  #getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions
      .filter((t) => INCLUDED_TRANSACTIONS.some((it) => t.Account?.endsWith(it)))
      .filter((t) => {
        const transactionDate = DateTime.fromISO(t.Date);
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

  #getTransactionsForAutoPay({
    isTransactionIncluded,
    transfers,
    paymentCountKey,
  }: AutoPayTransaction): AutoPay[] {
    const allBankPayments = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .map((t, i) => {
        const fromAccount = getFromAccount(t.Account);

        if (!transfers[i] || !fromAccount) return null;

        return {
          fromAccount,
          toAccount: transfers[i],
          amount: t.Amount,
        };
      });

    const newBankPayments: AutoPay[] = allBankPayments
      .filter((p): p is AutoPay => p !== null)
      .slice(TransactionCounts.getTransactionCount(paymentCountKey));

    TransactionCounts.addToTransactionCount(newBankPayments.length, paymentCountKey);
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

  async getBalanceSheet() {
    const checkingBalance = formatFromDollars(this.balances[WELLS_FARGO_CHECKING]);
    const wfActiveCreditCard = formatFromDollars(this.balances[WELLS_FARGO_ACTIVE_CASH]);
    const wfPlatinumCreditCard = formatFromDollars(this.balances[WELLS_FARGO_PLATINUM]);
    const wfAutographCreditCard = formatFromDollars(this.balances[WELLS_FARGO_AUTOGRAPH]);
    const amexBlueCreditCard = formatFromDollars(this.balances[AMEX_BLUE]);
    const chaseFreedomUnlimitedCreditCard = formatFromDollars(
      this.balances[CHASE_FREEDOM_UNLIMITED]
    );

    const today = new Date();

    const balanceSheet: string[][] = [
      [
        'Wells Fargo Checking Balance',
        format(today, 'P'),
        formatToDollars(checkingBalance),
        formatToDollars(checkingBalance),
      ],
    ];

    balanceSheet.push([
      'Wells Fargo Active Balance',
      format(today, 'P'),
      formatToDollars(wfActiveCreditCard),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Wells Fargo Platinum Balance',
      format(today, 'P'),
      formatToDollars(wfPlatinumCreditCard),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Wells Fargo Autograph Balance',
      format(today, 'P'),
      formatToDollars(wfAutographCreditCard),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Amex Blue Balance',
      format(today, 'P'),
      formatToDollars(amexBlueCreditCard),
      OVERALL_FORMULA,
    ]);

    balanceSheet.push([
      'Chase Freedom Unlimited Balance',
      format(today, 'P'),
      formatToDollars(chaseFreedomUnlimitedCreditCard),
      OVERALL_FORMULA,
    ]);

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
