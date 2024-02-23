import { Transaction } from '../types/transaction';
import { includesName } from '../utils/includes-name';

export const TRANSACTION_HEADERS = [
  'date',
  'description',
  'originalDescription',
  'amount',
  'type',
  'category',
  'account',
  'labels',
  'notes',
];

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

export const ACCOUNT_NAME = Object.freeze({
  CHASE: 'TOTAL CHECKING',
  WELLS_FARGO: 'Wells Fargo Everyday Checking',
});

export const FROM_ACCOUNT: Record<string, string> = Object.freeze({
  [ACCOUNT_NAME.CHASE]: WALLET_ACCOUNT.CHASE_CHECKING,
  [ACCOUNT_NAME.WELLS_FARGO]: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
});

export const TRANSACTION_TYPE = Object.freeze({
  DEBIT: 'debit',
  CREDIT: 'credit',
});

export const INCOME_NAME = 'BETTERLESSON';

export const TEMPLATE_TRANSACTION = Object.freeze({
  CHASE_INCOME: {
    walletAccountName: WALLET_ACCOUNT.CHASE_CHECKING,
    template: 'Chase Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'chaseIncome',
    isTransactionIncluded: (t: Transaction) =>
      t.description.includes(INCOME_NAME) && t.account === ACCOUNT_NAME.CHASE,
  },
  WELLS_FARGO_INCOME: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Wells Fargo Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'wellsFargoIncome',
    isTransactionIncluded: (t: Transaction) =>
      t.description.includes(INCOME_NAME) && t.account === ACCOUNT_NAME.WELLS_FARGO,
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
      includesName(t.description, 'DEPT EDUCATION STUDENT'),
  },
});

const isAutoPayTransaction =
  (autoPayName: string) =>
  (t: Transaction): boolean =>
    includesName(t.description, autoPayName) &&
    ([ACCOUNT_NAME.CHASE, ACCOUNT_NAME.WELLS_FARGO] as string[]).includes(t.account);

export const AUTO_PAY = Object.freeze({
  CHASE: {
    paymentCountKey: 'chasePayments',
    isTransactionIncluded: isAutoPayTransaction('CHASE CREDIT CRD'),
    transfers: [
      WALLET_ACCOUNT.CHASE_AMAZON,
      WALLET_ACCOUNT.CHASE_FREEDOM_FLEX,
      WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED,
    ],
  },
  AMEX: {
    paymentCountKey: 'amexPayments',
    isTransactionIncluded: isAutoPayTransaction('AMERICAN EXPRESS ACH PMT'),
    transfers: [WALLET_ACCOUNT.AMEX_GOLD, WALLET_ACCOUNT.AMEX_BLUE],
  },
  CAPITAL_ONE: {
    paymentCountKey: 'capitalOnePayments',
    isTransactionIncluded: isAutoPayTransaction('CAPITAL ONE'),
    transfers: [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X],
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('DISCOVER E-PAYMENT'),
    transfers: [WALLET_ACCOUNT.DISCOVER_IT],
  },
  WELLS_FARGO: {
    paymentCountKey: 'wellsFargoPayments',
    isTransactionIncluded: isAutoPayTransaction('WF CREDIT CARD AUTO PAY'),
    transfers: [
      WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH,
      WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH,
      WALLET_ACCOUNT.WELLS_FARGO_PLATINUM,
    ],
  },
});
