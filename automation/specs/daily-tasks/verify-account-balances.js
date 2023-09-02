/* eslint-disable no-console */
import { WALLET_ACCOUNT } from '../../constants/transaction';
import WalletDashboardPage from '../../pageobjects/wallet-dashboard-page';
import { buildBalanceHTML } from '../../utils/balance-html';
import { sendEmail } from '../../utils/notification';

const {
  CHASE_CHECKING,
  AMEX_GOLD,
  CAPITAL_ONE_VENTURE_X,
  CITI_CUSTOM_CASH,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
  WELLS_FARGO_PLATINUM,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_ACTIVE_CASH,
  AMEX_BLUE,
  WELLS_FARGO_AUTOGRAPH,
  CITI_DOUBLE_CASH,
} = process.env;

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.WELLS_FARGO_CHECKING]: WELLS_FARGO_CHECKING,
  [WALLET_ACCOUNT.AMEX_GOLD]: AMEX_GOLD,
  [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]: CAPITAL_ONE_VENTURE_X,
  [WALLET_ACCOUNT.CITI_CUSTOM_CASH]: CITI_CUSTOM_CASH,
  [WALLET_ACCOUNT.CHASE_FREEDOM_FLEX]: CHASE_FREEDOM_FLEX,
  [WALLET_ACCOUNT.DISCOVER_IT]: DISCOVER_IT,
  [WALLET_ACCOUNT.CHASE_AMAZON]: CHASE_AMAZON,
  [WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED]: CHASE_FREEDOM_UNLIMITED,
  [WALLET_ACCOUNT.WELLS_FARGO_PLATINUM]: WELLS_FARGO_PLATINUM,
  [WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH]: WELLS_FARGO_ACTIVE_CASH,
  [WALLET_ACCOUNT.AMEX_BLUE]: AMEX_BLUE,
  [WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH]: WELLS_FARGO_AUTOGRAPH,
  [WALLET_ACCOUNT.CITI_DOUBLE_CASH]: CITI_DOUBLE_CASH,
};

const balanceDifference = (expected, actual) => {
  const expectedInPennies = (parseInt((expected || '').replace(/\D/g, ''), 10) / 100);
  const actualInPennies = (parseInt((actual || '').replace(/\D/g, ''), 10) / 100);
  const difference = expectedInPennies - actualInPennies;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference);
};

const NOTIFICATION_HOURS = [16];

export const verifyAccountBalance = async (actualBalances) => {
  const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

  const accountBalance = Object.entries(ACCOUNTS).map(([name, number]) => ({
    accountName: name,
    expectedBalance: expectedBalances[name],
    actualBalance: actualBalances[number],
    difference: balanceDifference(
      expectedBalances[name],
      actualBalances[number],
    ),
  }));

  if (NOTIFICATION_HOURS.includes(new Date().getHours())) {
    await sendEmail({
      subject: 'Balance Verification',
      text: 'Balances',
      html: buildBalanceHTML(accountBalance),
    });
  } else {
    console.log('Balances: ', accountBalance);
  }

  await browser.pause(5000);
};