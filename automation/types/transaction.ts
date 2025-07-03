export type Transaction = {
  date: string;
  account: string;
  description: string;
  amount: string;
};

export type Balance = {
  accountName: string;
  expectedBalance: string;
  actualBalance: string;
  difference: string;
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

export type ExpectedJointTransaction = {
  identifier: string;
  name: string;
  amount: number;
  day: string;
  days?: string[];
  type: string;
  validateTransaction?: (t: Transaction) => boolean;
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
  transfers: (index: number) => string | null;
};
