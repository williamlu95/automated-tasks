import { WALLET_ACCOUNT } from './account';

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
