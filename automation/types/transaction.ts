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
