import {
  addDays,
  getMonth, getYear, isWednesday, nextWednesday, startOfMonth,
} from 'date-fns';

const WEEK_IN_DAYS = 7;

const getPayDaysForMonth = (currentDate: Date, payDays: number[] = []): number[] => {
  const isFutureMonth = getMonth(currentDate) > getMonth(new Date())
    && getYear(currentDate) === getYear(new Date());
  const isFutureYear = getYear(currentDate) > getYear(new Date());

  if (isFutureMonth || isFutureYear) {
    return payDays;
  }

  const nextPayDate = addDays(currentDate, WEEK_IN_DAYS * 2);

  if (getMonth(currentDate) === getMonth(new Date())) {
    return getPayDaysForMonth(
      nextPayDate,
      [...payDays, currentDate.getDate()],
    );
  }

  return getPayDaysForMonth(nextPayDate, payDays);
};

const getSecondWednesday = () => {
  const firstDayOfMonth = startOfMonth(new Date());
  const firstWednesday = isWednesday(firstDayOfMonth)
    ? firstDayOfMonth
    : nextWednesday(firstDayOfMonth);

  return addDays(firstWednesday, WEEK_IN_DAYS).getDate();
};

export type ExpectedTransaction = {
  identifier: string;
  name: string;
  amount: number;
  day: number;
  days?: number[];
  type:string;
}

export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

export const INCOME: Record<string, ExpectedTransaction> = Object.freeze({
  MOTHER_SALARY: {
    identifier: 'Mother\'s Salary',
    name: 'HEALTH PLAN OF N DIR DEP',
    amount: 500.00,
    day: 0,
    days: getPayDaysForMonth(new Date('09/29/23')),
    type: TRANSACTION_TYPE.INCOME,
  },
  FATHER_SSDI: {
    identifier: 'Father\'s SSDI',
    name: 'SSA TREAS 310',
    amount: 1959.00,
    day: getSecondWednesday(),
    type: TRANSACTION_TYPE.INCOME,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  UTILITIES: {
    identifier: 'Utilities',
    name: 'NORTH LAS VEGAS DIRECT-DR',
    amount: 121.00,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  ELECTRICITY: {
    identifier: 'NV Energy',
    name: 'NV ENERGY SOUTH NPC PYMT',
    amount: 122.00,
    day: 2,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOA: {
    identifier: 'HOA',
    name: 'Cantura Home',
    amount: 30.00,
    day: 5,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SOLAR: {
    identifier: 'Sunrun',
    name: 'SUNRUN',
    amount: 103.00,
    day: 6,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  NATURAL_GAS: {
    identifier: 'SW Gas',
    name: 'SOUTHWEST GAS',
    amount: 122.00,
    day: 12,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  MORTGAGE: {
    identifier: 'Mortgage',
    name: 'US BANK HOME MTG',
    amount: 1540.00,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  IRS: {
    identifier: 'IRS',
    name: 'IRS USATAXPYMT',
    amount: 170.00,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_INSURANCE: {
    identifier: 'GEICO',
    name: 'GEICO',
    amount: 90.00,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  HOME_SECURITY: {
    identifier: 'Vivint',
    name: 'VIVINT',
    amount: 33.00,
    day: 15,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  INTERNET: {
    identifier: 'Cox Cable',
    name: 'COX LAS VEGAS COMM',
    amount: 140.00,
    day: 18,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  CAR_LOAN: {
    identifier: 'Nissan',
    name: 'Nissan Auto Loan',
    amount: 540.00,
    day: 27,
    type: TRANSACTION_TYPE.EXPENSE,
  },
  SAVINGS: {
    identifier: 'Savings',
    name: 'AMERICANEXPRESS TRANSFER',
    amount: 0.00,
    day: 28,
    type: TRANSACTION_TYPE.EXPENSE,
  },
});

export type BalanceSheet = {
  name: string;
  date: string;
  amount: string;
  overall: string;
};
