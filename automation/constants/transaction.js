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

export const INCOME_NAME = 'BETTERLESSON';

export const WALLET_TRANSACTION = Object.freeze({
  [ACCOUNT_NAME.CHASE]: {
    name: WALLET_ACCOUNT.CHASE_CHECKING,
    template: 'Chase Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'chaseIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME),
  },
  [ACCOUNT_NAME.WELLS_FARGO]: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Wells Fargo Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'wellsFargoIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME),
  },
  [ACCOUNT_NAME.CITI_DOUBLE]: {
    walletAccountName: WALLET_ACCOUNT.CITI_DOUBLE_CASH,
    template: 'Citi Double Expense',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'citiDoubleExpense',
    isTransactionIncluded: (t) => t.type === TRANSACTION_TYPE.DEBIT,
  },
});

export const AUTO_PAY = Object.freeze({
  CHASE: {
    name: 'CHASE CREDIT CRD',
    paymentCountKey: 'chasePayments',
    transfers: [
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.CHASE_AMAZON,
      },
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.CHASE_FREEDOM_FLEX,
      },
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED,
      },
    ],
  },
  AMEX: {
    name: 'AMERICAN EXPRESS ACH PMT',
    paymentCountKey: 'amexPayments',
    transfers: [
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.AMEX_GOLD,
      },
      {
        from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
        to: WALLET_ACCOUNT.AMEX_BLUE,
      },
    ],
  },
  CAPITAL_ONE: {
    name: 'CAPITAL ONE',
    paymentCountKey: 'capitalOnePayments',
    transfers: [{
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X,
    }],
  },
  CITI: {
    name: 'CITI AUTOPAY',
    paymentCountKey: 'citiPayments',
    transfers: [{
      from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
      to: WALLET_ACCOUNT.CITI_CUSTOM_CASH,
    }],
  },
  DISCOVER: {
    name: 'DISCOVER E-PAYMENT',
    paymentCountKey: 'discoverPayments',
    transfers: [{
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.DISCOVER_IT,
    }],
  },
  WELLS_FARGO: {
    name: 'WF CREDIT CARD AUTO PAY',
    paymentCountKey: 'wellsFargoPayments',
    transfers: [
      {
        from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
        to: WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH,
      },
      {
        from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
        to: WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH,
      },
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.WELLS_FARGO_PLATINUM,
      },
    ],
  },
});

export const AUTO_PAY_NAMES = Object.values(AUTO_PAY).map(({ name }) => name);

export const BILL = Object.freeze({
  GEICO: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH,
    name: 'GEICO',
    template: 'Geico',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'geicoPayments',
  },
  TMOBILE: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    name: 'TMOBILE*AUTO',
    template: 'T-Mobile',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'tmobilePayments',
  },
});
