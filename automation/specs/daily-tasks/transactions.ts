import * as csv from 'csvtojson';
import { endOfMonth, getMonth, isSameDay } from 'date-fns';
import {
  TEMPLATE_TRANSACTION, ACCOUNT_NAME, AUTO_PAY, FROM_ACCOUNT, TRANSACTION_HEADERS,
} from '../../constants/transaction';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';
import { TransactionCounts } from '../../utils/transaction-counts';
import {
  AutoPayTransaction, TemplateTransaction, Transaction,
} from '../../types/transaction';

export type Template = Omit<Omit<TemplateTransaction, 'isTransactionIncluded'>, 'transactionCountKey'> & { amount: string }
export type AutoPay = { fromAccount: string; toAccount: string; amount: string }

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
    await MintLoginPage.open();
    await MintLoginPage.loginToPersonal();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactionsForCurrentMonth = this.#getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.templateTransactions = Object.values(TEMPLATE_TRANSACTION)
      .flatMap((t) => this.#getTransactionsForTemplate(t));

    this.autoPayTransactions = Object.values(AUTO_PAY)
      .flatMap((p) => this.#getTransactionsForAutoPay(p));

    this.balances = await MintTransactionPage.getAllAccountBalances();
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
      amount: t.amount,
    }));
  }

  #getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const currentMonth = TransactionCounts.getTransactionMonth();
      const isSameMonth = getMonth(transactionDate) === currentMonth;

      if (isSameMonth) {
        return true;
      }

      const lastMonth = new Date(new Date().getFullYear(), currentMonth - 1);
      const isLastDayOfLastMonth = isSameDay(transactionDate, endOfMonth(lastMonth));
      const isWellsFargoCheckingAccount = t.account === ACCOUNT_NAME.WELLS_FARGO;

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
        const fromAccount = FROM_ACCOUNT[t.account];

        if (!transfers[i] || !fromAccount) return null;

        return {
          fromAccount,
          toAccount: transfers[i],
          amount: t.amount,
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
