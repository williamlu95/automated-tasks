import { DateTime } from 'luxon';
import {
  AUTO_PAY,
  TEMPLATE_TRANSACTION,
  WALLET_ACCOUNT,
} from '../../../constants/personal-transactions';
import {
  Transaction,
  TemplateTransaction,
  AutoPayTransaction,
} from '../../../types/transaction';
import { BaseTransactions } from '../../../utils/base-transaction';
import { DailyTaskData } from '../daily-task-data';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  DISCOVER_IT = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  AMEX_GOLD = '',
  DELTA_SKYMILES_GOLD = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [
  CHASE_CHECKING,
  CAPITAL_ONE_VENTURE_X,
  CITI_CUSTOM_CASH,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  AMEX_GOLD,
  DELTA_SKYMILES_GOLD,
];

export type Template = Omit<
  Omit<TemplateTransaction, 'isTransactionIncluded'>,
  'transactionCountKey'
> & { amount: string };
export type AutoPay = {
  fromAccount: string;
  toAccount: string;
  amount: string;
};

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
    console.log(
      `Transactions: ${JSON.stringify(
        this.transactionsForCurrentMonth,
        null,
        4,
      )}`,
    );

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION).flatMap(
      (t) => this.getTransactionsForTemplate(t),
    );

    this.autoPayTransactions = Object.values(AUTO_PAY).flatMap((p) => this.getTransactionsForAutoPay(p));
    console.log(
      `AutoPay Transactions: ${JSON.stringify(
        this.autoPayTransactions,
        null,
        4,
      )}`,
    );
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

  protected getTransactionsForCurrentMonth(
    transactions: Transaction[],
  ): Transaction[] {
    const transactionsForCurrentMonth = transactions
      .filter((t) => INCLUDED_TRANSACTIONS.some((it) => t.account?.endsWith(it)))
      .filter((t) => {
        const transactionDate = DateTime.fromISO(t.date);
        const isSameMonth = transactionDate.hasSame(DateTime.now(), 'month');

        if (isSameMonth) {
          return true;
        }

        const lastDayOfLastMonth = DateTime.now()
          .minus({ month: 1 })
          .endOf('month');
        const isLastDayOfLastMonth = transactionDate.hasSame(
          lastDayOfLastMonth,
          'day',
        );

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
}
