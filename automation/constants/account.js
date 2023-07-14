import { INCOME_NAME } from './income';

export const WALLET_ACCOUNT = Object.freeze({
  CHASE_CHECKING: 'Chase Checking',
  AMEX_GOLD: 'AMEX Gold',
  CAPITAL_ONE_VENTURE_X: 'Capital One Venture X',
  CITI_CUSTOM_CASH: 'Citi Custom Cash',
  CHASE_FREEDOM_FLEX: 'Chase Freedom Flex',
  DISCOVER_IT: 'Discover It',
  CHASE_AMAZON: 'Chase Amazon',
  CHASE_FREEDOM_UNLIMITED: 'Chase Freedom Unlimited',
  WELLS_FARGO_PLATINUM: 'Wells Fargo Platinum',
  WELLS_FARGO_CHECKING: 'Wells Fargo Checking',
  WELLS_FARGO_ACTIVE_CASH: 'Wells Fargo Active Cash',
  AMEX_BLUE: 'AMEX Blue',
  WELLS_FARGO_AUTOGRAPH: 'Wells Fargo Autograph',
  CITI_DOUBLE_CASH: 'Citi Double Cash',
});

export const ACCOUNT_NAME = Object.freeze({
  CHASE: 'TOTAL CHECKING',
  WELLS_FARGO: 'Wells Fargo College Checking®',
  CITI_DOUBLE: 'Citi Double Cash® Card',
});

export const TRANSACTION_TYPE = Object.freeze({
  DEBIT: 'debit',
  CREDIT: 'credit',
});

export const WALLET_TRANSACTION = Object.freeze({
  [ACCOUNT_NAME.CHASE]: {
    name: WALLET_ACCOUNT.CHASE_CHECKING,
    template: 'Chase Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'chaseIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME),
  },
  [ACCOUNT_NAME.WELLS_FARGO]: {
    name: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Wells Fargo Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'wellsFargoIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME),
  },
  [ACCOUNT_NAME.CITI_DOUBLE]: {
    name: WALLET_ACCOUNT.CITI_DOUBLE_CASH,
    template: 'Citi Double Expense',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'citiDoubleExpense',
    isTransactionIncluded: (t) => t.type === TRANSACTION_TYPE.DEBIT,
  },
});
