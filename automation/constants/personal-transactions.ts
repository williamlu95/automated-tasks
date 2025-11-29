import { DateTime } from 'luxon';
import { ExpectedJointTransaction, ExpectedTransaction, Transaction } from '../types/transaction';
import { getSemiMonthylPayDaysForMonths } from '../utils/date-formatters';
import { includesName } from '../utils/includes-name';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  DISCOVER_IT = '',
  WELLS_FARGO_PLATINUM = '',
  AMEX_GOLD = '',
} = process.env;

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
  WF_PLATINUM: 'Wells Fargo Platinum',
  WF_ACTIVE_CASH: 'Wells Fargo Active Cash',
  CITI_DOUBLE_CASH: 'Citi Double Cash',
  CITI_PREMIER: 'Citi Strata Premier',
  CHASE_SAPPHIRE_PREFERRED: 'Chase Sapphire Preferred',
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
    isTransactionIncluded: (t: Transaction) => includesName(t.description, INCOME_NAME) && t.account?.endsWith(CHASE_CHECKING),
  },
  VENTURE_X: {
    walletAccountName: WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X,
    template: 'Venture X',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'capitalOnePayments',
    isTransactionIncluded: (t: Transaction) => includesName(t.description, 'Capital One') && t.account.includes(CAPITAL_ONE_VENTURE_X),
  },
  AMEX_GOLD: {
    walletAccountName: WALLET_ACCOUNT.AMEX_GOLD,
    template: 'Amex Gold',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'amexGold',
    isTransactionIncluded: (t: Transaction) => includesName(t.description, 'Autopay Payment') && t.account.includes(AMEX_GOLD),
  },
});

const isAutoPayTransaction = (autoPayName: string, accountName: string = CHASE_CHECKING) => (t: Transaction): boolean => includesName(t.description, autoPayName) && t.account.includes(accountName);

export const AUTO_PAY = Object.freeze({
  CHASE_AMAZON: {
    paymentCountKey: 'chaseAmazonPayments',
    isTransactionIncluded: isAutoPayTransaction('Automatic Payment', CHASE_AMAZON),
    transfers: () => WALLET_ACCOUNT.CHASE_AMAZON,
  },
  CHASE_FREEDOM_FLEX: {
    paymentCountKey: 'chaseFlexPayments',
    isTransactionIncluded: isAutoPayTransaction('Automatic Payment', CHASE_FREEDOM_FLEX),
    transfers: () => WALLET_ACCOUNT.CHASE_FREEDOM_FLEX,
  },
  CITI_CUSTOM: {
    paymentCountKey: 'citiCustomPayments',
    isTransactionIncluded: isAutoPayTransaction('Autopay', CITI_CUSTOM_CASH),
    transfers: () => WALLET_ACCOUNT.CITI_CUSTOM_CASH,
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('Directpay Full Balance', DISCOVER_IT),
    transfers: () => WALLET_ACCOUNT.DISCOVER_IT,
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
  TMOBILE: {
    identifier: 'T-Mobile',
    name: 'T-mobile',
    amount: 241.0,
    day: 15,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => {
      const date = DateTime.fromISO(t.date);
      return date.day >= 15 && date.month === DateTime.now().month;
    },
  },
  HULU: {
    identifier: 'Hulu',
    name: 'Hulu',
    amount: 26.0,
    day: 21,
    type: TRANSACTION_TYPE.DEBIT,
  },
  AMAZON: {
    identifier: 'Amazon',
    name: 'Amazon',
    amount: 7.0,
    day: 22,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => t.account.includes(WELLS_FARGO_PLATINUM),
  },
  STUDENT_LOAN: {
    identifier: 'Student Loan',
    name: 'DEPT EDUCATION STUDENT',
    amount: 348.0,
    day: 28,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => {
      const transactionDate = DateTime.fromISO(t.date);
      return transactionDate.day >= 20 && transactionDate.month === DateTime.now().month;
    },
  },
});
