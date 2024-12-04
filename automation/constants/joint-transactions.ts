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

export const FOOD_BUDGET = 600;

export const CREDIT_CARD_BILL = {
  WATER_BILL: 'Las Vegas Valley Water District',
  SEWER_BILL: 'City Of Las Vegas',
  UFC_FIT: 'Ufc Fit',
  CAR_INSURANCE_BILL: 'Geico',
  INTERNET_BILL: 'Cox Communications',
  TRASH_BILL: 'Republic Services',
  SPOTIFY: 'Spotify',
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
    amount: 2250.0,
    day: '0',
    days: getSemiMonthylPayDaysForMonths(),
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const generateExpenseForDate = (date: DateTime): Record<string, ExpectedTransaction> => ({
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'Pennymac',
    amount: 3450.0,
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
    name: CREDIT_CARD_BILL.WATER_BILL,
    amount: 50.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SEWER: {
    identifier: 'Sewer',
    name: CREDIT_CARD_BILL.SEWER_BILL,
    amount: calculateSewerTotalAmount(80.0, date),
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  UFC_FIT: {
    identifier: 'UFC Fit',
    name: CREDIT_CARD_BILL.UFC_FIT,
    amount: 60,
    day: 4,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_INSURANCE: {
    identifier: 'Car Insurance',
    name: CREDIT_CARD_BILL.CAR_INSURANCE_BILL,
    amount: 215.0,
    day: 9,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'Electric',
    name: 'Nv Energy',
    amount: 204.0,
    day: 10,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Internet',
    name: CREDIT_CARD_BILL.INTERNET_BILL,
    amount: 90.0,
    day: 14,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MAMA_KO_LOAN: {
    identifier: 'Mama Ko Loan',
    name: 'Jpmorgan',
    amount: 465.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
    validateTransaction: (t) => Math.abs(parseInt(t.Amount, 10)) === 465,
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
    amount: 50.0,
    day: 18,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  TRASH: {
    identifier: 'Trash',
    name: CREDIT_CARD_BILL.TRASH_BILL,
    amount: calculateQuarterlyTotalAmountDue(57.0, date),
    day: 20,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  TUNDRA: {
    identifier: 'Tundra',
    name: 'Toyota',
    amount: 823.0,
    day: 20,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SPOTIFY: {
    identifier: 'Spotify',
    name: CREDIT_CARD_BILL.SPOTIFY,
    amount: 17.0,
    day: 28,
    type: TRANSACTION_TYPE.EXPENSE,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = generateExpenseForDate(DateTime.now());
