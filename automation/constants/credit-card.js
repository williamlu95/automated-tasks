import { WALLET_ACCOUNT } from './account';

export const PAYMENT_COUNT_KEY = Object.freeze({
  CHASE: 'chasePayments',
  AMEX: 'amexPayments',
  CAPITAL_ONE: 'capitalOnePayments',
  CITI: 'citiPayments',
  DISCOVER: 'discoverPayments',
  WELLS_FARGO: 'wellsFargoPayments',
});

export const AUTO_PAY_NAME = Object.freeze({
  CHASE: 'CHASE CREDIT CRD',
  AMEX: 'AMERICAN EXPRESS ACH PMT',
  CAPITAL_ONE: 'CAPITAL ONE',
  CITI: 'CITI AUTOPAY',
  DISCOVER: 'DISCOVER E-PAYMENT',
  WELLS_FARGO: 'WF CREDIT CARD AUTO PAY',
});

export const AUTO_PAY_NAMES = Object.values(AUTO_PAY_NAME);

export const AUTO_PAY = Object.freeze({
  CHASE: [
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
  AMEX: [
    {
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.AMEX_GOLD,
    },
    {
      from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
      to: WALLET_ACCOUNT.AMEX_BLUE,
    },
  ],
  CAPITAL_ONE: [{
    from: WALLET_ACCOUNT.CHASE_CHECKING,
    to: WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X,
  }],
  CITI: [
    {
      from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
      to: WALLET_ACCOUNT.CITI_DOUBLE_CASH,
    },
    {
      from: WALLET_ACCOUNT.CHASE_CHECKING,
      to: WALLET_ACCOUNT.CITI_CUSTOM_CASH,
    },
  ],
  DISCOVER: [{
    from: WALLET_ACCOUNT.WELLS_FARGO_CHECKING,
    to: WALLET_ACCOUNT.DISCOVER_IT,
  }],
  WELLS_FARGO: [
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
});
