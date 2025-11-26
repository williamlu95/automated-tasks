import { DateTime, Interval } from 'luxon';

const MONTHS_IN_QUARTER = 3;

export const calculateSewerTotalAmount = (total: number, today: DateTime): number => {
  const quarter = today.startOf('quarter').minus({ month: 1 });
  const monthsSinceQuarter = Math.ceil(today.diff(quarter, ['months']).toObject().months || 0) % MONTHS_IN_QUARTER;
  const monthlyAmount = total / MONTHS_IN_QUARTER;

  if (monthsSinceQuarter === 0) {
    return total;
  }

  return monthlyAmount * monthsSinceQuarter;
};

export const calculateQuarterlyTotalAmountDue = (total: number, today: DateTime): number => {
  const monthsSinceQuarter = Math.ceil(
    today.diff(today.startOf('quarter'), ['months']).toObject().months || 1,
  );

  const monthlyAmount = total / MONTHS_IN_QUARTER;
  return monthlyAmount * monthsSinceQuarter;
};

const MONTHS_IN_SEMI_YEAR = 6;
const MONTHS_IN_YEAR = 12;

const calculateMonthsSinceLastSemiYear = (today: DateTime): number => {
  const start = DateTime.fromObject({ month: 4 });
  const end = DateTime.fromObject({ month: 10 });
  const interval = Interval.fromDateTimes(start, end);

  if (interval.isAfter(today)) {
    return Math.ceil(today.diff(end.minus({ year: 1 }), ['months']).toObject().months || 1);
  }

  if (interval.isBefore(today)) {
    return Math.ceil(today.diff(end, ['months']).toObject().months || 1);
  }

  return Math.ceil(today.diff(start, ['months']).toObject().months || 1);
};

export const calculateSemiYearlyTotalAmountDue = (total: number, today: DateTime): number => {
  const monthsSinceSemiYear = calculateMonthsSinceLastSemiYear(today);
  const monthlyAmount = total / MONTHS_IN_SEMI_YEAR;
  return monthlyAmount * monthsSinceSemiYear;
};

const calculateMonthsUntilYearlyDue = (today: DateTime, originalDueDate: DateTime): number => {
  const potentialDueDate = originalDueDate.set({ year: today.year });
  const actualDueDate = potentialDueDate.toMillis() >= today.toMillis() ? potentialDueDate : potentialDueDate.plus({ year: 1 });
  return Math.ceil(actualDueDate.diff(today, ['months']).toObject().months || 1);
};

export const calculateYearlyTotalAmountDue = (total: number, today: DateTime, originalDueDate: DateTime): number => {
  const monthsUntilDueDate = MONTHS_IN_YEAR - calculateMonthsUntilYearlyDue(today, originalDueDate);

  if (monthsUntilDueDate === 0) {
    return total;
  }

  const monthlyAmount = total / MONTHS_IN_YEAR;
  return monthlyAmount * monthsUntilDueDate;
};
