import { DateTime } from 'luxon';
import { ExpectedJointTransaction, ExpectedTransaction } from '../types/transaction';
import {
  calculateSemiYearlyTotalAmountDue,
  calculateQuarterlyTotalAmountDue,
  calculateSewerTotalAmount,
} from '../utils/calculator';
import {
  getBiweeklyPayDaysForMonths,
  getSemiMonthylPayDaysForMonths,
} from '../utils/date-formatters';

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const INCOME: Record<string, ExpectedJointTransaction> = Object.freeze({
  LISA_SALARY: {
    identifier: "Lisa's Salary",
    name: 'Sunrise Hospital',
    amount: 950.0,
    day: '0',
    days: getBiweeklyPayDaysForMonths(new Date('11/15/23')),
    type: TRANSACTION_TYPE.INCOME,
  },
  WILL_SALARY: {
    identifier: "William's Salary",
    name: 'Betterlesson',
    amount: 2000.0,
    day: '0',
    days: getSemiMonthylPayDaysForMonths(),
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const generateExpenseForDate = (date: DateTime): Record<string, ExpectedTransaction> => {
  return {
    MORTGAGE: {
      identifier: 'Mortgage',
      name: 'Pennymac',
      amount: 3230.0,
      day: 1,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    SIDS: {
      identifier: 'SIDs',
      name: 'City Of Lv Sid',
      amount: calculateSemiYearlyTotalAmountDue(195.0, date),
      day: 1,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    WATER: {
      identifier: 'Water',
      name: 'Las Vegas Valley Water District',
      amount: 50.0,
      day: 1,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    SEWER: {
      identifier: 'Sewer',
      name: 'City Of Las Vegas',
      amount: calculateSewerTotalAmount(80.0, date),
      day: 1,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    CAR_INSURANCE: {
      identifier: 'Car Insurance',
      name: 'Geico',
      amount: 220.0,
      day: 9,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    ELECTRICITY: {
      identifier: 'Electric',
      name: 'Nv Energy',
      amount: 300.0,
      day: 10,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    INTERNET: {
      identifier: 'Internet',
      name: 'Cox Communications',
      amount: 95.0,
      day: 14,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    MAMA_KO_LOAN: {
      identifier: 'Mama Ko Loan',
      name: 'Jpmorgan',
      amount: 465.0,
      day: 15,
      type: TRANSACTION_TYPE.EXPENSE,
      validateTransaction: (t) => Math.abs(parseInt(t.Amount)) === 465,
    },
    HOA: {
      identifier: 'HOA',
      name: 'Skye Hills Commu',
      amount: 85.0,
      day: 15,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    NATURAL_GAS: {
      identifier: 'Natural Gas',
      name: 'Southwest Gas',
      amount: 120.0,
      day: 18,
      type: TRANSACTION_TYPE.EXPENSE,
    },
    TRASH: {
      identifier: 'Trash',
      name: 'NOT KNOWN YET',
      amount: calculateQuarterlyTotalAmountDue(55.0, date),
      day: 20,
      type: TRANSACTION_TYPE.EXPENSE,
    },
  };
};

export const EXPENSE: Record<string, ExpectedTransaction> = generateExpenseForDate(DateTime.now());
