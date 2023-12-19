import { WALLET_ACCOUNT } from '../../../constants/transaction';
import GoogleBalanceSheetPage from '../../../pageobjects/google-balance-sheet-page';
import WalletDashboardPage from '../../../pageobjects/wallet-dashboard-page';

const {
  CHASE_CHECKING,
  AMEX_GOLD,
  CAPITAL_ONE_VENTURE_X,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
  CHASE_FREEDOM_UNLIMITED,
  WELLS_FARGO_PLATINUM,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_ACTIVE_CASH,
  AMEX_BLUE,
  WELLS_FARGO_AUTOGRAPH,
} = process.env;

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.WELLS_FARGO_CHECKING]: WELLS_FARGO_CHECKING,
  [WALLET_ACCOUNT.AMEX_GOLD]: AMEX_GOLD,
  [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]: CAPITAL_ONE_VENTURE_X,
  [WALLET_ACCOUNT.CHASE_FREEDOM_FLEX]: CHASE_FREEDOM_FLEX,
  [WALLET_ACCOUNT.DISCOVER_IT]: DISCOVER_IT,
  [WALLET_ACCOUNT.CHASE_AMAZON]: CHASE_AMAZON,
  [WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED]: CHASE_FREEDOM_UNLIMITED,
  [WALLET_ACCOUNT.WELLS_FARGO_PLATINUM]: WELLS_FARGO_PLATINUM,
  [WALLET_ACCOUNT.WELLS_FARGO_ACTIVE_CASH]: WELLS_FARGO_ACTIVE_CASH,
  [WALLET_ACCOUNT.AMEX_BLUE]: AMEX_BLUE,
  [WALLET_ACCOUNT.WELLS_FARGO_AUTOGRAPH]: WELLS_FARGO_AUTOGRAPH,
};

const balanceDifference = (expected: string, actual: string): string => {
  const expectedInPennies = parseInt((expected || '').replace(/\D/g, ''), 10) / 100;
  const actualInPennies = parseInt((actual || '').replace(/\D/g, ''), 10) / 100;
  const difference = expectedInPennies - actualInPennies;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference);
};

export const verifyAccountBalance = async (
  actualBalances: Record<string, string>
): Promise<void> => {
  const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

  const accountBalance = Object.entries(ACCOUNTS).map(([name, number = '']) => ({
    accountName: name,
    expectedBalance: expectedBalances[name],
    actualBalance: actualBalances[number],
    difference: balanceDifference(expectedBalances[name], actualBalances[number]),
  }));

  await GoogleBalanceSheetPage.openPersonalBalanceSheet();
  await GoogleBalanceSheetPage.setCreditBalances(accountBalance);
  await browser.pause(5000);
};
