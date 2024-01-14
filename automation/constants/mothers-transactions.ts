import { ExpectedTransaction } from '../types/transaction';
import { getPayDaysForMonth, getSecondWednesday } from '../utils/date-formatters';

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const INCOME: Record<string, ExpectedTransaction> = Object.freeze({
  MOTHER_SALARY: {
    identifier: "Mother's Salary",
    name: 'UNITED HEALTHCAR',
    amount: 500.0,
    day: 0,
    days: getPayDaysForMonth(new Date('09/29/23')),
    type: TRANSACTION_TYPE.INCOME,
  },
  FATHER_SSDI: {
    identifier: "Father's SSDI",
    name: 'SSA TREAS 310',
    amount: 1959.0,
    day: getSecondWednesday(),
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  UTILITIES: {
    identifier: 'Utilities',
    name: 'CNLV UTILITIES',
    amount: 121.0,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'NV Energy',
    name: 'NV ENERGY SOUTH NPC PYMT',
    amount: 122.0,
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
    name: 'SUNRUN',
    amount: 103.0,
    day: 6,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  NATURAL_GAS: {
    identifier: 'SW Gas',
    name: 'SOUTHWEST GAS',
    amount: 122.0,
    day: 12,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'US BANK HOME MTG',
    amount: 1540.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  IRS: {
    identifier: 'IRS',
    name: 'IRS USATAXPYMT',
    amount: 170.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_INSURANCE: {
    identifier: 'GEICO',
    name: 'GEICO',
    amount: 90.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOME_SECURITY: {
    identifier: 'Vivint',
    name: 'VIVINT',
    amount: 33.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Cox Cable',
    name: 'COX LAS VEGAS COMM',
    amount: 140.0,
    day: 18,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_LOAN: {
    identifier: 'Nissan',
    name: 'Nissan Auto Loan',
    amount: 540.0,
    day: 27,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SAVINGS: {
    identifier: 'Savings',
    name: 'AMERICANEXPRESS TRANSFER',
    amount: 0.0,
    day: 28,
    type: TRANSACTION_TYPE.EXPENSE,
  },
});
