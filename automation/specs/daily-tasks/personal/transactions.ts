import * as csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import { TransactionCounts } from '../../../utils/transaction-counts';
import EmpowerLoginPage from '../../../pageobjects/empower-login-page';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import {
  AUTO_PAY,
  AutoPayTransaction,
  TEMPLATE_TRANSACTION,
  TRANSACTION_HEADERS,
  TemplateTransaction,
  Transaction,
  getFromAccount,
} from '../../../constants/personal-transactions';

export type Template = Omit<
  Omit<TemplateTransaction, 'isTransactionIncluded'>,
  'transactionCountKey'
> & { amount: string };
export type AutoPay = { fromAccount: string; toAccount: string; amount: string };

const { WELLS_FARGO_CHECKING = '' } = process.env;

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
    await EmpowerLoginPage.open();
    await EmpowerLoginPage.loginToPersonal();
    await EmpowerTransactionPage.open();
    const transactionsPath = await EmpowerTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);
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
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.Date);
      const currentMonth = TransactionCounts.getTransactionMonth();
      const isSameMonth = getMonth(transactionDate) === currentMonth;

      if (isSameMonth) {
        return true;
      }

      const lastMonth = new Date(new Date().getFullYear(), currentMonth - 1);
      const isLastDayOfLastMonth = isSameDay(transactionDate, endOfMonth(lastMonth));
      const isWellsFargoCheckingAccount = t.Account.endsWith(WELLS_FARGO_CHECKING);

      if (isLastDayOfLastMonth && isWellsFargoCheckingAccount) {
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
