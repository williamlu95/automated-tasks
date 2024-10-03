import { ExpectedJointTransaction, ExpectedTransaction } from '../types/transaction';
import { getBiweeklyPayDaysForMonths, getSecondWednesday, getSecondWednesdayForMonths } from '../utils/date-formatters';

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const INCOME: Record<string, ExpectedJointTransaction> = Object.freeze({
  MOTHER_SALARY: {
    identifier: "Mother's Salary",
    name: 'Unitedhealth Group',
    amount: 450.0,
    day: '0',
    days: getBiweeklyPayDaysForMonths(new Date('09/29/23')),
    type: TRANSACTION_TYPE.INCOME,
  },
  FATHER_SSDI: {
    identifier: "Father's SSDI",
    name: 'Social Security Administration',
    amount: 2018.1,
    day: getSecondWednesday(),
    days: getSecondWednesdayForMonths(),
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  UTILITIES: {
    identifier: 'Utilities',
    name: 'City Of North Las Vegas',
    amount: 121.0,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'NV Energy',
    name: 'Nv Energy',
    amount: 80.0,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOA: {
    identifier: 'HOA',
    name: 'Cantura Home',
    amount: 30.0,
    day: 5,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SOLAR: {
    identifier: 'Sunrun',
    name: 'Sunrun',
    amount: 103.0,
    day: 6,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  NATURAL_GAS: {
    identifier: 'SW Gas',
    name: 'Southwest Gas',
    amount: 122.0,
    day: 12,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'Us Bank',
    amount: 1540.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_INSURANCE: {
    identifier: 'GEICO',
    name: 'Geico',
    amount: 123.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOME_SECURITY: {
    identifier: 'Vivint',
    name: 'Vivint',
    amount: 33.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Cox Cable',
    name: 'Cox Communications',
    amount: 107.0,
    day: 18,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOME_WARRANTY: {
    identifier: 'Home Warranty',
    name: 'Choice Home Warranty',
    amount: 60.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOME_EQUITY_LOAN: {
    identifier: 'Home Equity Loan',
    name: 'NOT_KNOWN_YET',
    amount: 409.0,
    day: 28,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SAVINGS: {
    identifier: 'Savings',
    name: 'American Express',
    amount: 200.0,
    day: 28,
    type: TRANSACTION_TYPE.EXPENSE,
  },
});
