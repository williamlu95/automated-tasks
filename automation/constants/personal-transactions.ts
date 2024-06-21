import { ExpectedJointTransaction, ExpectedTransaction } from '../types/transaction';
import { getSemiMonthylPayDaysForMonths } from '../utils/date-formatters';
import { Transaction } from '../types/transaction';
import { includesName } from '../utils/includes-name';

const { CHASE_CHECKING = '' } = process.env;

export const WALLET_ACCOUNT = Object.freeze({
  CHASE_CHECKING: 'Chase Checking',
  AMEX_GOLD: 'AMEX Gold',
  CAPITAL_ONE_VENTURE_X: 'Capital One Venture X',
  CHASE_FREEDOM_FLEX: 'Chase Freedom Flex',
  DISCOVER_IT: 'Discover It',
  CHASE_AMAZON: 'Chase Amazon',
  CHASE_FREEDOM_UNLIMITED: 'Chase Freedom Unlimited',
  CITI_CUSTOM_CASH: 'Citi Custom Cash',
  MARRIOTT_BOUNDLESS: 'Marriott Boundless',
});

export const TRANSACTION_TYPE = Object.freeze({
  DEBIT: 'debit',
  CREDIT: 'credit',
});

export const CATEGORY_TYPE = Object.freeze({
  CREDIT_CARD_PAYMENT: 'Credit Card Payments',
});

export const INCOME_NAME = 'BETTERLESSON';

export const TEMPLATE_TRANSACTION = Object.freeze({
  CHASE_INCOME: {
    walletAccountName: WALLET_ACCOUNT.CHASE_CHECKING,
    template: 'Chase Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'chaseIncome',
    isTransactionIncluded: (t: Transaction) =>
      includesName(t.Description, INCOME_NAME) && t.Account?.endsWith(CHASE_CHECKING),
  },
});

export const getFromAccount = (accountName: string): string => {
  if (accountName.endsWith(CHASE_CHECKING)) return WALLET_ACCOUNT.CHASE_CHECKING;
  return '';
};

const isAutoPayTransaction =
  (autoPayName: string) =>
  (t: Transaction): boolean =>
    includesName(t.Description, autoPayName) && t.Account?.endsWith(CHASE_CHECKING);

export const AUTO_PAY = Object.freeze({
  CHASE: {
    paymentCountKey: 'chasePayments',
    isTransactionIncluded: isAutoPayTransaction('Chase'),
    transfers: [WALLET_ACCOUNT.CHASE_AMAZON, WALLET_ACCOUNT.CHASE_FREEDOM_FLEX],
  },
  CITI: {
    paymentCountKey: 'citiPayments',
    isTransactionIncluded: isAutoPayTransaction('Citibank'),
    transfers: [WALLET_ACCOUNT.CITI_CUSTOM_CASH],
  },
  CAPITAL_ONE: {
    paymentCountKey: 'capitalOnePayments',
    isTransactionIncluded: isAutoPayTransaction('Capital One'),
    transfers: [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X],
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('Discovery Trading Post'),
    transfers: [WALLET_ACCOUNT.DISCOVER_IT],
  },
});

export const INCOME: Record<string, ExpectedJointTransaction> = Object.freeze({
  WILL_SALARY: {
    identifier: "William's Salary",
    name: 'Betterlesson',
    amount: 300.0,
    day: '0',
    days: getSemiMonthylPayDaysForMonths(),
    type: TRANSACTION_TYPE.CREDIT,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  GOOGLE_ONE: {
    identifier: 'Google One',
    name: 'Google',
    amount: 3.0,
    day: 14,
    type: TRANSACTION_TYPE.DEBIT,
  },
  HULU: {
    identifier: 'Hulu',
    name: 'Hulu',
    amount: 18.0,
    day: 21,
    type: TRANSACTION_TYPE.DEBIT,
  },
  AMAZON_PRIME: {
    identifier: 'Amazon Prime',
    name: 'Amazon Prime',
    amount: 7.0,
    day: 22,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => t.Category === 'Dues & Subscriptions',
  },
  EOS: {
    identifier: 'EOS',
    name: 'Eos Fitness',
    amount: 27.0,
    day: 23,
    type: TRANSACTION_TYPE.DEBIT,
  },
  TMOBILE: {
    identifier: 'T-Mobile',
    name: 'T-mobile',
    amount: 170.0,
    day: 25,
    type: TRANSACTION_TYPE.DEBIT,
  },
  STUDENT_LOAN: {
    identifier: 'Student Loan',
    name: 'Us Department Of Education',
    amount: 346.0,
    day: 28,
    type: TRANSACTION_TYPE.DEBIT,
  },
});
