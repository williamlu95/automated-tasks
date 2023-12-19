export type Transaction = {
  date: string;
  description: string;
  originalDescription: string;
  amount: string;
  type: string;
  category: string;
  account: string;
  labels: string;
  notes: string;
};

export type TemplateTransaction = {
  walletAccountName: string;
  template: string;
  type: string;
  transactionCountKey: string;
  isTransactionIncluded: (t: Transaction) => boolean;
};

export type AutoPayTransaction = {
  paymentCountKey: string;
  isTransactionIncluded: (t: Transaction) => boolean;
  transfers: string[];
};

export type Balance = {
  accountName: string;
  expectedBalance: string;
  actualBalance: string;
  difference: string;
};

export type BalanceSheet = {
  name: string;
  date: string;
  amount: string;
  overall: string;
};

export type ExpectedTransaction = {
  identifier: string;
  name: string;
  amount: number;
  day: number;
  days?: number[];
  type: string;
  validateTransaction?: (t: Transaction) => boolean;
};
