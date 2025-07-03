import { DateTime } from 'luxon';
import { ExpectedJointTransaction, ExpectedTransaction, Transaction } from '../types/transaction';
import { getSemiMonthylPayDaysForMonths } from '../utils/date-formatters';
import { includesName } from '../utils/includes-name';

const {
  CHASE_CHECKING = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CITI_DOUBLE_CASH = '',
  CITI_PREMIER = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  CHASE_SAPPHIRE_PREFERRED = '',
  WELLS_FARGO_PLATINUM = '',
  WELLS_FARGO_ACTIVE_CASH = '',
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
  CHASE_SAPPHIRE_PREFERRED: {
    paymentCountKey: 'chaseSapphirePayments',
    isTransactionIncluded: isAutoPayTransaction('Automatic Payment', CHASE_SAPPHIRE_PREFERRED),
    transfers: () => WALLET_ACCOUNT.CHASE_SAPPHIRE_PREFERRED,
  },
  CITI_CUSTOM: {
    paymentCountKey: 'citiCustomPayments',
    isTransactionIncluded: isAutoPayTransaction('Autopay', CITI_CUSTOM_CASH),
    transfers: () => WALLET_ACCOUNT.CITI_CUSTOM_CASH,
  },
  CITI_DOUBLE: {
    paymentCountKey: 'citiDoublePayments',
    isTransactionIncluded: isAutoPayTransaction('Autopay', CITI_DOUBLE_CASH),
    transfers: () => WALLET_ACCOUNT.CITI_DOUBLE_CASH,
  },
  CITI_PREMIER: {
    paymentCountKey: 'citiPremierPayments',
    isTransactionIncluded: isAutoPayTransaction('Autopay', CITI_PREMIER),
    transfers: () => WALLET_ACCOUNT.CITI_PREMIER,
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('Discover Bank'),
    transfers: () => WALLET_ACCOUNT.DISCOVER_IT,
  },
  WELLS_FARGO_ACTIVE_CASH: {
    paymentCountKey: 'wellsFargoActiveCashPayments',
    isTransactionIncluded: isAutoPayTransaction('Automatic Payment', WELLS_FARGO_ACTIVE_CASH),
    transfers: () => WALLET_ACCOUNT.WF_ACTIVE_CASH,
  },
  WELLS_FARGO_PLATINUM: {
    paymentCountKey: 'wellsFargoPlatinumPayments',
    isTransactionIncluded: isAutoPayTransaction('Automatic Payment', WELLS_FARGO_PLATINUM),
    transfers: () => WALLET_ACCOUNT.WF_PLATINUM,
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
  DIGITAL_OCEAN: {
    identifier: 'DigitalOcean',
    name: 'DigitalOcean',
    amount: 6.0,
    day: 1,
    type: TRANSACTION_TYPE.DEBIT,
  },
  HULU: {
    identifier: 'Hulu',
    name: 'Hulu',
    amount: 23.0,
    day: 21,
    type: TRANSACTION_TYPE.DEBIT,
  },
  TMOBILE: {
    identifier: 'T-Mobile',
    name: 'T-mobile',
    amount: 195.0,
    day: 25,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => {
      const date = DateTime.fromISO(t.date);
      return date.day >= 25 && date.month === DateTime.now().month;
    },
  },
  STUDENT_LOAN: {
    identifier: 'Student Loan',
    name: 'Us Department Of Education',
    amount: 348.0,
    day: 28,
    type: TRANSACTION_TYPE.DEBIT,
    validateTransaction: (t) => {
      const transactionDate = DateTime.fromISO(t.date);
      return transactionDate.day >= 28 && transactionDate.month === DateTime.now().month;
    },
  },
});
