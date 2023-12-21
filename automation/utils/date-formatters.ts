import {
  addDays,
  differenceInMonths,
  getMonth,
  getYear,
  isWednesday,
  nextWednesday,
  startOfMonth,
  format,
  addMonths,
  endOfMonth,
} from 'date-fns';

const WEEK_IN_DAYS = 7;
export const ADDITIONAL_MONTHS = 2;

const FIRST_PAY_DAY = new Date();
FIRST_PAY_DAY.setDate(15);

export const getPayDaysForMonth = (currentDate: Date, payDays: number[] = []): number[] => {
  const isFutureMonth =
    getMonth(currentDate) > getMonth(new Date()) && getYear(currentDate) === getYear(new Date());
  const isFutureYear = getYear(currentDate) > getYear(new Date());

  if (isFutureMonth || isFutureYear) {
    return payDays;
  }

  const nextPayDate = addDays(currentDate, WEEK_IN_DAYS * 2);

  if (getMonth(currentDate) === getMonth(new Date())) {
    return getPayDaysForMonth(nextPayDate, [...payDays, currentDate.getDate()]);
  }

  return getPayDaysForMonth(nextPayDate, payDays);
};

export const getBiweeklyPayDaysForMonths = (
  currentDate: Date,
  payDays: string[] = []
): string[] => {
  const monthDifference = differenceInMonths(startOfMonth(currentDate), startOfMonth(new Date()));
  if (monthDifference > ADDITIONAL_MONTHS) {
    return payDays;
  }

  const nextPayDate = addDays(currentDate, WEEK_IN_DAYS * 2);

  if (monthDifference >= 0) {
    return getBiweeklyPayDaysForMonths(nextPayDate, [...payDays, format(currentDate, 'P')]);
  }

  return getBiweeklyPayDaysForMonths(nextPayDate, payDays);
};

export const getSemiMonthylPayDaysForMonths = (
  currentDate = FIRST_PAY_DAY,
  payDays: string[] = []
): string[] => {
  if (differenceInMonths(startOfMonth(currentDate), startOfMonth(new Date())) > ADDITIONAL_MONTHS) {
    return payDays;
  }

  const additionalPayDays = [format(currentDate, 'P'), format(endOfMonth(currentDate), 'P')];
  return getSemiMonthylPayDaysForMonths(addMonths(currentDate, 1), [
    ...payDays,
    ...additionalPayDays,
  ]);
};

export const getSecondWednesday = () => {
  const firstDayOfMonth = startOfMonth(new Date());
  const firstWednesday = isWednesday(firstDayOfMonth)
    ? firstDayOfMonth
    : nextWednesday(firstDayOfMonth);

  return addDays(firstWednesday, WEEK_IN_DAYS).getDate();
};
