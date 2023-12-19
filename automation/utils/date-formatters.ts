import { addDays, getMonth, getYear, isWednesday, nextWednesday, startOfMonth } from 'date-fns';

const WEEK_IN_DAYS = 7;

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

export const getSecondWednesday = () => {
  const firstDayOfMonth = startOfMonth(new Date());
  const firstWednesday = isWednesday(firstDayOfMonth)
    ? firstDayOfMonth
    : nextWednesday(firstDayOfMonth);

  return addDays(firstWednesday, WEEK_IN_DAYS).getDate();
};
