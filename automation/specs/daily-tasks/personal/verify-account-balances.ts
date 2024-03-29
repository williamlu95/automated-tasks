import { WALLET_ACCOUNT } from '../../../constants/personal-transactions';
import WalletDashboardPage from '../../../pageobjects/wallet-dashboard-page';
import { replaceSheetData } from '../../../utils/google-sheets';

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
} = process.env;

const CHECKING_ACCOUNTS = [CHASE_CHECKING, WELLS_FARGO_CHECKING];

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.AMEX_GOLD]: AMEX_GOLD,
  [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]: CAPITAL_ONE_VENTURE_X,
  [WALLET_ACCOUNT.CHASE_FREEDOM_FLEX]: CHASE_FREEDOM_FLEX,
  [WALLET_ACCOUNT.DISCOVER_IT]: DISCOVER_IT,
  [WALLET_ACCOUNT.CHASE_AMAZON]: CHASE_AMAZON,
  [WALLET_ACCOUNT.CHASE_FREEDOM_UNLIMITED]: CHASE_FREEDOM_UNLIMITED,
  [WALLET_ACCOUNT.WELLS_FARGO_PLATINUM]: WELLS_FARGO_PLATINUM,
};

const balanceDifference = (expected: string, actual: string): string => {
  const expectedInPennies = parseInt((expected || '').replace(/\D/g, ''), 10) / 100;
  const actualInPennies = parseInt((actual || '').replace(/\D/g, ''), 10) / 100;
  const difference = expectedInPennies - actualInPennies;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference);
};

export const verifyAccountBalance = async (
  actualBalances: Record<string, string>,
  balanceSheet: string[][]
): Promise<void> => {
  const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

  const accountBalance = Object.entries(ACCOUNTS).map(([name, number = '']) => {
    const actualBalance = CHECKING_ACCOUNTS.includes(number)
      ? actualBalances[number]
      : `-${actualBalances[number]}`;

    return [
      name,
      expectedBalances[name],
      actualBalance,
      balanceDifference(expectedBalances[name], actualBalance),
    ];
  });

  await replaceSheetData("William's Balance", accountBalance);
  await replaceSheetData('Personal Balance', balanceSheet);
};
