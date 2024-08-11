import { format } from 'date-fns';
import { EXPENSE, INCOME, TRANSACTION_TYPE } from '../../../constants/mothers-transactions';
import { formatFromDollars, formatToDollars } from '../../../utils/currency-formatter';
import EmpowerTransactionPage from '../../../pageobjects/empower-transaction-page';
import { OVERALL_FORMULA } from '../../../utils/balance';
import { BaseTransactions } from '../../../utils/base-transaction';

const { MOTHERS_WF = '', MOTHERS_CITI = '' } = process.env;

const INCLUDED_TRANSACTIONS: string[] = [MOTHERS_WF, MOTHERS_CITI];

export class MothersTransactions extends BaseTransactions {
  private balances: Record<string, string>;

  constructor() {
    super(INCLUDED_TRANSACTIONS);
    this.balances = {};
  }

  async initializeTransactions() {
    const transactions = await EmpowerTransactionPage.downloadTransactions();

    this.transactionsForCurrentMonth = this.getTransactionsForCurrentMonth(transactions);
    console.log(`Transactions: ${JSON.stringify(this.transactionsForCurrentMonth, null, 4)}`);

    this.outstandingExpenses = this.calculateOutstandingExpenses(EXPENSE);
    console.log(`Outstanding Expenses: ${JSON.stringify(this.outstandingExpenses, null, 4)}`);

    this.outstandingIncome = this.calculateOutstandingIncome(INCOME);
    console.log(`Outstanding Income: ${JSON.stringify(this.outstandingIncome, null, 4)}`);

    this.balances = await EmpowerTransactionPage.getAllAccountBalances();
    console.log(`Balances: ${JSON.stringify(this.balances, null, 4)}`);
  }

  protected getInitialBalanceSheet() {
    const today = new Date();
    return [
      ['Checking Account Balance', formatFromDollars(this.balances[MOTHERS_WF])],
      ['Credit Card Balance', formatFromDollars(this.balances[MOTHERS_CITI])],
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
      const amount = t.type === TRANSACTION_TYPE.INCOME ? t.amount : -t.amount;

      balanceSheet.push([
        t.identifier,
        t.day,
        formatToDollars(amount),
        OVERALL_FORMULA,
      ]);
    });

    return balanceSheet;
  }

  getBalances() {
    return this.balances;
  }
}
