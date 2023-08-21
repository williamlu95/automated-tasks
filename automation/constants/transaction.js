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
  WELLS_FARGO: 'Wells Fargo Everyday Checking',
  CITI_DOUBLE: 'Citi Double Cash® Card',
});

export const TRANSACTION_TYPE = Object.freeze({
  DEBIT: 'debit',
  CREDIT: 'credit',
});

export const INCOME_NAME = 'BETTERLESSON';

const includesName = (description, name) => {
  const normalizedDescription = description.replace(/\s/g, '').toLowerCase();
  const normalizedName = name.replace(/\s/g, '').toLowerCase();

  return normalizedDescription.includes(normalizedName);
};

export const TEMPLATE_TRANSACTION = Object.freeze({
  CHASE_INCOME: {
    walletAccountName: WALLET_ACCOUNT.CHASE_CHECKING,
    template: 'Chase Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'chaseIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME)
    && t.account === ACCOUNT_NAME.CHASE,
  },
  WELLS_FARGO_INCOME: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    template: 'Wells Fargo Income',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'wellsFargoIncome',
    isTransactionIncluded: (t) => t.description.includes(INCOME_NAME)
    && t.account === ACCOUNT_NAME.WELLS_FARGO,
  },
  GEICO: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH,
    template: 'Geico',
    type: TRANSACTION_TYPE.CREDIT,
    transactionCountKey: 'geicoPayments',
    isTransactionIncluded: (t) => includesName(t.description, 'GEICO')
    && t.account !== ACCOUNT_NAME.CITI_DOUBLE,
  },
  TMOBILE: {
    walletAccountName: WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH,
    template: 'T-Mobile',
    type: TRANSACTION_TYPE.DEBIT,
    transactionCountKey: 'tmobilePayments',
    isTransactionIncluded: () => false,
  },
});

const isAutoPayTransaction = (autoPayName) => (t) => includesName(t.description, autoPayName)
&& [ACCOUNT_NAME.CHASE, ACCOUNT_NAME.WELLS_FARGO].includes(t.account);

export const AUTO_PAY = Object.freeze({
  CHASE: {
    paymentCountKey: 'chasePayments',
    isTransactionIncluded: isAutoPayTransaction('CHASE CREDIT CRD'),
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
    paymentCountKey: 'amexPayments',
    isTransactionIncluded: isAutoPayTransaction('AMERICAN EXPRESS ACH PMT'),
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
    paymentCountKey: 'capitalOnePayments',
    isTransactionIncluded: isAutoPayTransaction('CAPITAL ONE'),
    transfers: [{
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X,
    }],
  },
  CITI: {
    paymentCountKey: 'citiPayments',
    isTransactionIncluded: isAutoPayTransaction('CITI AUTOPAY'),
    transfers: [
      {
        from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
        to: WALLET_ACCOUNT.CITI_DOUBLE_CASH,
      },
      {
        from: WALLET_ACCOUNT.CHASE_CHECKING,
        to: WALLET_ACCOUNT.CITI_CUSTOM_CASH,
      },
    ],
  },
  DISCOVER: {
    paymentCountKey: 'discoverPayments',
    isTransactionIncluded: isAutoPayTransaction('DISCOVER E-PAYMENT'),
    transfers: [{
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.DISCOVER_IT,
    }],
  },
  WELLS_FARGO: {
    paymentCountKey: 'wellsFargoPayments',
    isTransactionIncluded: isAutoPayTransaction('WF CREDIT CARD AUTO PAY'),
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
