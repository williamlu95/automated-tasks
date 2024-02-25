import { Transaction } from '../types/transaction';
import { includesName } from '../utils/includes-name';

const { CHASE_CHECKING = '', WELLS_FARGO_CHECKING = '' } = process.env;

export const WALLET_ACCOUNT = Object.freeze({
  CHASE_CHECKING: 'Chase Checking',
  AMEX_GOLD: 'AMEX Gold',
  CAPITAL_ONE_VENTURE_X: 'Capital One Venture X',
  CHASE_FREEDOM_FLEX: 'Chase Freedom Flex',
  DISCOVER_IT: 'Discover It',
  CHASE_AMAZON: 'Chase Amazon',
  CHASE_FREEDOM_UNLIMITED: 'Chase Freedom Unlimited',
  WELLS_FARGO_PLATINUM: 'Wells Fargo Platinum',
  WELLS_FARGO_CHECKING: 'Wells Fargo Checking',
  WELLS_FARGO_ACTIVE_CASH: 'Wells Fargo Active Cash',
  AMEX_BLUE: 'AMEX Blue',
  WELLS_FARGO_AUTOGRAPH: 'Wells Fargo Autograph',
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
      includesName(t.Description, INCOME_NAME) && t.Account.endsWith(CHASE_CHECKING),
  },
  WELLS_FARGO_INCOME: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Wells Fargo Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'wellsFargoIncome',
    isTransactionIncluded: (t: Transaction) =>
      includesName(t.Description, INCOME_NAME) && t.Account.endsWith(WELLS_FARGO_CHECKING),
  },
  TMOBILE: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH,
    template: 'T-Mobile',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'tmobilePayments',
    isTransactionIncluded: () => false,
  },
  STUDENT_LOAN: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Student Loan',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'studentLoanPayments',
    isTransactionIncluded: (t: Transaction) =>
      includesName(t.Description, 'Us Department Of Education'),
  },
});

export const getFromAccount = (accountName: string): string => {
  if (accountName.endsWith(CHASE_CHECKING)) return WALLET_ACCOUNT.CHASE_CHECKING;
  if (accountName.endsWith(WELLS_FARGO_CHECKING)) return WALLET_ACCOUNT.WELLS_FARGO_CHECKING;
  return '';
};

const isAutoPayTransaction =
  (autoPayName: string) =>
  (t: Transaction): boolean =>
    includesName(t.Description, autoPayName) &&
    (t.Account.endsWith(CHASE_CHECKING) || t.Account.endsWith(WELLS_FARGO_CHECKING));

export const AUTO_PAY = Object.freeze({
  CHASE: {
    paymentCountKey: 'chasePayments',
    isTransactionIncluded: isAutoPayTransaction('Chase'),
    transfers: [
      WALLET_ACCOUNT.CHASE_AMAZON,
      WALLET_ACCOUNT.CHASE_FREEDOM_FLEX,
      WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED,
    ],
  },
  AMEX: {
    paymentCountKey: 'amexPayments',
    isTransactionIncluded: (t: Transaction) =>
      isAutoPayTransaction('American Express')(t) &&
      t.Category === CATEGORY_TYPE.CREDIT_CARD_PAYMENT,
    transfers: [WALLET_ACCOUNT.AMEX_GOLD, WALLET_ACCOUNT.AMEX_BLUE],
  },
  CAPITAL_ONE: {
    paymentCountKey: 'capitalOnePayments',
    isTransactionIncluded: isAutoPayTransaction('Capital One'),
    transfers: [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X],
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('Discover Bank'),
    transfers: [WALLET_ACCOUNT.DISCOVER_IT],
  },
  WELLS_FARGO: {
    paymentCountKey: 'wellsFargoPayments',
    isTransactionIncluded: isAutoPayTransaction('Wells Fargo Bank'),
    transfers: [
      WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH,
      WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH,
      WALLET_ACCOUNT.WELLS_FARGO_PLATINUM,
    ],
  },
});
