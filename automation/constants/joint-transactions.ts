import { endOfMonth } from 'date-fns';
import { ExpectedTransaction } from '../types/transaction';
import { getPayDaysForMonth } from '../utils/date-formatters';

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const INCOME: Record<string, ExpectedTransaction> = Object.freeze({
  MOTHER_SALARY: {
    identifier: "Lisa's Salary",
    name: 'Sunrise Hospital',
    amount: 950.0,
    day: 0,
    days: getPayDaysForMonth(new Date('12/15/23')),
    type: TRANSACTION_TYPE.INCOME,
  },
  FATHER_SSDI: {
    identifier: "William's Salary",
    name: 'BETTERLESSON',
    amount: 1845.0,
    day: 0,
    days: [15, endOfMonth(new Date()).getDate()],
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'PENNYMAC',
    amount: 3230.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  WATER: {
    identifier: 'Water',
    name: 'LASVEGASVALLEYWATER',
    amount: 50.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SEWER: {
    identifier: 'Sewer',
    name: 'LASVEGASVALLEYSEWER',
    amount: 25.0,
    day: 1,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  FURNITURE: {
    identifier: 'Furniture (Custom Cash)',
    name: 'CITI AUTOPAY',
    amount: 240.0,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_INSURANCE: {
    identifier: 'GEICO',
    name: 'GEICO',
    amount: 141.0,
    day: 9,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'NV Energy',
    name: 'NV ENERGY',
    amount: 400.0,
    day: 10,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Internet',
    name: 'COX LAS VEGAS COMM',
    amount: 110.0,
    day: 14,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MAMA_KO_LOAN: {
    identifier: 'Mama Ko Loan',
    name: 'JPMORGAN CHASE BANK',
    amount: 465.0,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
    validateTransaction: (t) => parseInt(t.amount) === 465,
  },
  NATURAL_GAS: {
    identifier: 'Natural Gas',
    name: 'SOUTHWEST GAS',
    amount: 120.0,
    day: 18,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  TRASH: {
    identifier: 'Trash',
    name: 'REPUBLIC SERVICES',
    amount: 20.0,
    day: 20,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOA: {
    identifier: 'HOA',
    name: 'NOT KNOWN YET',
    amount: 85.0,
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
