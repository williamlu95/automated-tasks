import { DateTime } from 'luxon';
import { addMonths, format } from 'date-fns';
import { ExpectedJointTransaction, ExpectedTransaction, Transaction } from '../types/transaction';
import { includesName } from './includes-name';
import { ADDITIONAL_MONTHS } from './date-formatters';

export class BaseTransactions {
  private includedTransactions: string[];

  protected transactionsForCurrentMonth: Transaction[];

  protected outstandingExpenses: ExpectedJointTransaction[];

  protected outstandingIncome: ExpectedJointTransaction[];

  constructor(includedTransactions: string[]) {
    this.includedTransactions = includedTransactions;
    this.transactionsForCurrentMonth = [];
    this.outstandingExpenses = [];
    this.outstandingIncome = [];
  }

  protected getTransactionsForCurrentMonth(transactions: Transaction[]): Transaction[] {
    const transactionsForCurrentMonth = transactions
      .filter((t) => this.includedTransactions.some((it) => t.Account?.endsWith(it)))
      .filter((t) => {
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

  protected calculateOutstandingExpenses(expenseTemplate: Record<string, ExpectedTransaction>): ExpectedJointTransaction[] {
    const expenses: ExpectedJointTransaction[] = [];

    Object.values(expenseTemplate).forEach((e) => {
      const isNotOustandingExpense = this.transactionsForCurrentMonth.some(
        (t) => includesName(t.Description, e.name)
                  && (!e.validateTransaction || e.validateTransaction(t)),
      );

      if (isNotOustandingExpense) {
        return;
      }

      expenses.push({ ...e, day: format(new Date().setDate(e.day), 'P'), days: undefined });
    });

    expenses.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    const futureExpenses = this.calculateFutureExpenses(expenseTemplate);
    return expenses.concat(futureExpenses);
  }

  protected calculateFutureExpenses(expenseTemplate: Record<string, ExpectedTransaction>): ExpectedJointTransaction[] {
    const futureDates = Array(ADDITIONAL_MONTHS)
      .fill(new Date())
      .map((date, index) => addMonths(date, index + 1));

    return futureDates.flatMap((futureDate) => Object.values(expenseTemplate).map((e) => ({
      ...e,
      day: format(new Date(futureDate).setDate(e.day), 'P'),
      days: undefined,
    })));
  }

  protected calculateOutstandingIncome(incomeTemplate:Record<string, ExpectedJointTransaction>): ExpectedJointTransaction[] {
    const income: ExpectedJointTransaction[] = [];

    Object.values(incomeTemplate).forEach((value) => {
      const paidSalary = this.transactionsForCurrentMonth.filter((t) => includesName(t.Description, value.name));

      const unpaidSalary = (value.days?.slice(paidSalary.length) || []).map((day) => ({
        ...value,
        day,
      }));

      income.push(...unpaidSalary);
    });

    return income.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }
}
