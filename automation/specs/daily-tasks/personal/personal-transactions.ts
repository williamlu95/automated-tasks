import { DateTime } from 'luxon';
import { format } from 'date-fns';
import WalletLoginPage from '../../../pageobjects/wallet-login-page';
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
import { includesName } from '../../../utils/includes-name';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import { OVERALL_FORMULA } from '../../../utils/balance';
import WalletRecordPage from '../../../pageobjects/wallet-record-page';
import { BaseTransactions } from '../../../utils/base-transaction';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CITI_DOUBLE_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  DISCOVER_IT = '',
  CHASE_AMAZON = '',
  CHASE_FREEDOM_UNLIMITED = '',
  WELLS_FARGO_CHECKING = '',
  WELLS_FARGO_ACTIVE_CASH = '',
  WELLS_FARGO_PLATINUM = '',
  AMEX_BLUE = '',
  WELLS_FARGO_AUTOGRAPH = '',
  MARRIOTT_BOUNDLESS = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [
  CHASE_CHECKING,
  CAPITAL_ONE_VENTURE_X,
  CITI_CUSTOM_CASH,
  CITI_DOUBLE_CASH,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_ACTIVE_CASH,
  WELLS_FARGO_PLATINUM,
  AMEX_BLUE,
  WELLS_FARGO_AUTOGRAPH,
  MARRIOTT_BOUNDLESS,
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

  async initializeTransactions() {
    await WalletLoginPage.open();
    await WalletLoginPage.login();
    this.transactionCounts = await WalletRecordPage.getTransactionCounts();
    console.log(`Transaction Counts: ${JSON.stringify(this.transactionCounts, null, 4)}`);

    const transactions = await EmpowerTransactionPage.downloadTransactions();
    this.balances = await EmpowerTransactionPage.getAllAccountBalances();

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION).flatMap((t) => this.getTransactionsForTemplate(t));

    this.autoPayTransactions = Object.values(AUTO_PAY).flatMap((p) => this.getTransactionsForAutoPay(p));

    this.outstandingExpenses = this.calculateOutstandingExpenses(EXPENSE);
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome();
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);
  }

  protected calculateOutstandingIncome(): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(INCOME).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter(
        (t) => includesName(t.Description, value.name)
          && t.Account?.endsWith(WELLS_FARGO_CHECKING)
          && DateTime.fromISO(t.Date).hasSame(DateTime.now(), 'month'),
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
      amount: t.Amount,
    }));
  }

  protected getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
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

  private getTransactionsForAutoPay({
    isTransactionIncluded,
    transfers,
    paymentCountKey,
  }: AutoPayTransaction): AutoPay[] {
    const allBankPayments = this.transactionsForCurrentMonth
      .filter((t) => isTransactionIncluded(t))
      .map((t, i) => {
        const fromAccount = getFromAccount(t.Account);

        if (!transfers(i) || !fromAccount) return null;

        return {
          fromAccount,
          toAccount: transfers(i),
          amount: t.Amount,
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

  protected getInitialBalanceSheet() {
    const today = new Date();
    return [
      ['Wells Fargo Checking Balance', formatFromDollars(this.balances[WELLS_FARGO_CHECKING])],
      ['Wells Fargo Active Balance', formatFromDollars(this.balances[WELLS_FARGO_ACTIVE_CASH])],
      ['Wells Fargo Platinum Balance', formatFromDollars(this.balances[WELLS_FARGO_PLATINUM])],
      ['Wells Fargo Autograph Balance', formatFromDollars(this.balances[WELLS_FARGO_AUTOGRAPH])],
      ['Amex Blue Balance', formatFromDollars(this.balances[AMEX_BLUE])],
      ['Chase Freedom Unlimited Balance', formatFromDollars(this.balances[CHASE_FREEDOM_UNLIMITED])],
      ['Citi Double Cash Balance', formatFromDollars(this.balances[CITI_DOUBLE_CASH])],
    ].map(([name, balance], index) => [name,
      format(today, 'P'),
      balance,
      index === 0 ? balance : OVERALL_FORMULA]);
  }

  async getBalanceSheet() {
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