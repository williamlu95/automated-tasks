export const formatToDollars = (amount: number | string): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount || 0));

export const formatFromDollars = (dollars: string): number => Number(dollars?.replace(/[$,]+/g, '') || 0);
