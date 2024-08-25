import { ExpectedJointTransaction, ExpectedTransaction, Transaction } from '../types/transaction';
import { getSemiMonthylPayDaysForMonths } from '../utils/date-formatters';
import { includesName } from '../utils/includes-name';
import { CREDIT_CARD_BILL } from './joint-transactions';

const { CHASE_CHECKING = '', MARRIOTT_BOUNDLESS = '' } = process.env;

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
});

export const getFromAccount = (accountName: string): string => {
  if (accountName.endsWith(CHASE_CHECKING)) return WALLET_ACCOUNT.CHASE_CHECKING;
  return '';
};

const isAutoPayTransaction = (autoPayName: string) => (t: Transaction): boolean => includesName(t.Description, autoPayName) && t.Account?.endsWith(CHASE_CHECKING);

export const AUTO_PAY = Object.freeze({
  CHASE: {
    paymentCountKey: 'chasePayments',
    isTransactionIncluded: isAutoPayTransaction('Chase'),
    transfers: (index: number) => [WALLET_ACCOUNT.CHASE_AMAZON, WALLET_ACCOUNT.CHASE_FREEDOM_FLEX, WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED][index] || null,
  },
  CITI: {
    paymentCountKey: 'citiPayments',
    isTransactionIncluded: isAutoPayTransaction('Citibank'),
    transfers: (index: number) => [WALLET_ACCOUNT.CITI_DOUBLE_CASH, WALLET_ACCOUNT.CITI_CUSTOM_CASH][index] || null,
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
  WELLS_FARGO: {
    paymentCountKey: 'wellsFargo',
    isTransactionIncluded: isAutoPayTransaction('Wells Fargo Bank'),
    transfers: (index: number) => [WALLET_ACCOUNT.WF_ACTIVE_CASH, WALLET_ACCOUNT.WF_PLATINUM][index] || null,
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
    amount: 160.0,
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
});
