import { WALLET_ACCOUNT } from '../../../constants/personal-transactions';
import WalletDashboardPage from '../../../pageobjects/wallet-dashboard-page';
import { notifyOfNeagtiveBalance } from '../../../utils/balance';
import { replaceSheetData } from '../../../utils/google-sheets';

const {
  CHASE_CHECKING,
  AMEX_GOLD,
  CAPITAL_ONE_VENTURE_X,
  CHASE_FREEDOM_FLEX,
  DISCOVER_IT,
  CHASE_AMAZON,
} = process.env;

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.AMEX_GOLD]: AMEX_GOLD,
  [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]: CAPITAL_ONE_VENTURE_X,
  [WALLET_ACCOUNT.CHASE_FREEDOM_FLEX]: CHASE_FREEDOM_FLEX,
  [WALLET_ACCOUNT.DISCOVER_IT]: DISCOVER_IT,
  [WALLET_ACCOUNT.CHASE_AMAZON]: CHASE_AMAZON,
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
  await notifyOfNeagtiveBalance(balanceSheet, 'Personal');

  const accountBalance = Object.entries(ACCOUNTS).map(([name, number = '']) => {
    const actualBalance = actualBalances[number];
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
