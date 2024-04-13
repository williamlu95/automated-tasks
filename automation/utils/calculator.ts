import { DateTime, Interval } from 'luxon';

const MONTHS_IN_QUARTER = 3;

export const calculateQuarterlyTotalAmountDue = (total: number, today: DateTime): number => {
  const monthsSinceQuarter = Math.ceil(
    today.diff(today.startOf('quarter'), ['months']).toObject().months || 1
  );

  const monthlyAmount = total / MONTHS_IN_QUARTER;
  return monthlyAmount * monthsSinceQuarter;
};

const MONTHS_IN_SEMI_YEAR = 6;

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
