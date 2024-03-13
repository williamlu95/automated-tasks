import { TransactionCounts } from '../../../utils/transaction-counts';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import {
  AUTO_PAY,
  TEMPLATE_TRANSACTION,
  getFromAccount,
} from '../../../constants/personal-transactions';
import { Transaction, TemplateTransaction, AutoPayTransaction } from '../../../types/transaction';
import { DateTime } from 'luxon';

const {
  CHASE_CHECKING = '',
  AMEX_GOLD = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  DISCOVER_IT = '',
  CHASE_AMAZON = '',
  CHASE_FREEDOM_UNLIMITED = '',
  WELLS_FARGO_PLATINUM = '',
  WELLS_FARGO_CHECKING = '',
  WELLS_FARGO_ACTIVE_CASH = '',
  AMEX_BLUE = '',
  WELLS_FARGO_AUTOGRAPH = '',
  CITI_DOUBLE_CASH = '',
} = process.env;

const INCLUDED_TRANSACTIONS = [
  CHASE_CHECKING,
  AMEX_GOLD,
  CAPITAL_ONE_VENTURE_X,
  CITI_CUSTOM_CASH,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
  WELLS_FARGO_PLATINUM,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_ACTIVE_CASH,
  AMEX_BLUE,
  WELLS_FARGO_AUTOGRAPH,
  CITI_DOUBLE_CASH,
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

  constructor() {
    this.transactionsForCurrentMonth = [];
    this.templateTransactions = [];
    this.autoPayTransactions = [];
    this.balances = {};
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
      .filter((t) => INCLUDED_TRANSACTIONS.some((it) => t.Account.endsWith(it)))
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
}
