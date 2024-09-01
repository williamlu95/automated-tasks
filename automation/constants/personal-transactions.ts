import { ExpectedJointTransaction, ExpectedTransaction, Transaction } from '../types/transaction';
import { getSemiMonthylPayDaysForMonths } from '../utils/date-formatters';
import { includesName } from '../utils/includes-name';
import { CREDIT_CARD_BILL } from './joint-transactions';

const {
  CHASE_CHECKING = '',
  MARRIOTT_BOUNDLESS = '',
  CITI_CUSTOM_CASH = '',
  CITI_DOUBLE_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  WELLS_FARGO_ACTIVE_CASH = '',
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
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, INCOME_NAME) && t.Account?.endsWith(CHASE_CHECKING),
  },
  WATER_BILL: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Water Bill',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'waterBill',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, CREDIT_CARD_BILL.WATER_BILL),
  },
  SEWER_BILL: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Sewer Bill',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'sewerBill',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, CREDIT_CARD_BILL.SEWER_BILL),
  },
  CAR_INSURANCE_BILL: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Car Insurance Bill',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'carInsuranceBill',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, CREDIT_CARD_BILL.CAR_INSURANCE_BILL),
  },
  INTERNET_BILL: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Internet Bill',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'internetBill',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, CREDIT_CARD_BILL.INTERNET_BILL),
  },
  TRASH_BILL: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Trash Bill',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'trashBill',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, CREDIT_CARD_BILL.TRASH_BILL),
  },
  MARRIOTT_BONVOY: {
    walletAccountName: WALLET_ACCOUNT.MARRIOTT_BOUNDLESS,
    template: 'Marriott Bonvoy',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'marriottBonvoy',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, 'Automatic Payment') && t.Account.includes(MARRIOTT_BOUNDLESS),
  },
  AMEX_GOLD: {
    walletAccountName: WALLET_ACCOUNT.AMEX_GOLD,
    template: 'Amex Gold',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'amexGold',
    isTransactionIncluded: (t: Transaction) => includesName(t.Description, 'Mobile Payment') && t.Account.includes(AMEX_GOLD),
  },
});

export const getFromAccount = (accountName: string): string => {
  if (accountName.endsWith(CHASE_CHECKING)) return WALLET_ACCOUNT.CHASE_CHECKING;
  return '';
};

const isAutoPayTransaction = (autoPayName: string, accountName: string = CHASE_CHECKING) => (t: Transaction): boolean => includesName(t.Description, autoPayName) && t.Account?.endsWith(accountName);

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
  CITI_DOUBLE: {
    paymentCountKey: 'citiDoublePayments',
    isTransactionIncluded: isAutoPayTransaction('Online Payment', CITI_DOUBLE_CASH),
    transfers: () => WALLET_ACCOUNT.CITI_DOUBLE_CASH,
  },
  CITI_CUSTOM: {
    paymentCountKey: 'citiCustomPayments',
    isTransactionIncluded: isAutoPayTransaction('Online Payment', CITI_CUSTOM_CASH),
    transfers: () => WALLET_ACCOUNT.CITI_CUSTOM_CASH,
  },
  CAPITAL_ONE: {
    paymentCountKey: 'capitalOnePayments',
    isTransactionIncluded: isAutoPayTransaction('Capital One'),
    transfers: () => WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X,
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('Discover Bank'),
    transfers: () => WALLET_ACCOUNT.DISCOVER_IT,
  },
  WELLS_FARGO_ACTIVE: {
    paymentCountKey: 'wellsFargoActivePayments',
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
    amount: 250.0,
    day: '0',
    days: getSemiMonthylPayDaysForMonths(),
    type: TRANSACTION_TYPE.CREDIT,
  },
});

export const EXPENSE: Record<string, ExpectedTransaction> = Object.freeze({
  HULU: {
    identifier: 'Hulu',
    name: 'Hulu',
    amount: 18.0,
    day: 21,
    type: TRANSACTION_TYPE.DEBIT,
  },
  TMOBILE: {
    identifier: 'T-Mobile',
    name: 'T-mobile',
    amount: 120.0,
    day: 25,
    type: TRANSACTION_TYPE.DEBIT,
  },
  STUDENT_LOAN: {
    identifier: 'Student Loan',
    name: 'Us Department Of Education',
    amount: 348.0,
    day: 28,
    type: TRANSACTION_TYPE.DEBIT,
  },
  NETFLIX: {
    identifier: 'Netflix',
    name: 'Netflix',
    amount: 7.0,
    day: 28,
    type: TRANSACTION_TYPE.DEBIT,
  },
});
