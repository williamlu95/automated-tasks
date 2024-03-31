export const formatToDollars = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const formatFromDollars = (dollars?: string): number =>
  Number((dollars || '').replace(/[^0-9.-]+/g, ''));
