import { ExpectedJointTransaction, ExpectedTransaction } from '../types/transaction';
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

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'Pennymac',
    amount: 3230.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  WATER: {
    identifier: 'Water',
    name: 'NOT KNOWN YET',
    amount: 50.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SEWER: {
    identifier: 'Sewer',
    name: 'NOT KNOWN YET',
    amount: 25.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  FURNITURE: {
    identifier: 'Furniture (Custom Cash)',
    name: 'Citibank',
    amount: 600.0,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
    validateTransaction: (t) => parseInt(t.Amount) === 600,
  },
  CAR_INSURANCE: {
    identifier: 'Car Insurance',
    name: 'Geico',
    amount: 141.0,
    day: 9,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'Electric',
    name: 'Nv Energy',
    amount: 400.0,
    day: 10,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Internet',
    name: 'Cox Communications',
    amount: 110.0,
    day: 14,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MAMA_KO_LOAN: {
    identifier: 'Mama Ko Loan',
    name: 'Jpmorgan',
    amount: 465.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
    validateTransaction: (t) => parseInt(t.Amount) === 465,
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
    amount: 20.0,
    day: 20,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SIDS: {
    identifier: 'SIDs',
    name: 'NOT KNOWN YET',
    amount: 35.0,
    day: 20,
    type: TRANSACTION_TYPE.EXPENSE,
  },
});
