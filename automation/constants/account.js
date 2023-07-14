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

export const INCOME_TEMPLATE_TYPE = Object.freeze({
  CHASE_INCOME: 'Chase Income',
  WELLS_FARGO_INCOME: 'Wells Fargo Income',
});

export const EXPENSE_TEMPLATE_TYPE = Object.freeze({
  CITI_DOUBLE_EXPENSE: 'Citi Double Expense',
});

export const CREDIT_CARD_NAME = Object.freeze({
  CITI_DOUBLE: 'Citi Double Cash® Card',
});

export const ACCOUNT_NAME = Object.freeze({
  'TOTAL CHECKING': WALLET_ACCOUNT.CHASE_CHECKING,
  'Wells Fargo College Checking®': WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
  [CREDIT_CARD_NAME.CITI_DOUBLE]: WALLET_ACCOUNT.CITI_DOUBLE_CASH,
});
