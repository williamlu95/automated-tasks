import { WALLET_ACCOUNT } from '../../../constants/personal-transactions';
import { notifyOfNegativeBalance } from '../../../utils/balance';
import { replaceSheetData } from '../../../utils/google-sheets';
import { DailyTaskData } from '../daily-task-data';

const {
  CHASE_CHECKING,
  CAPITAL_ONE_VENTURE_X,
  CHASE_FREEDOM_FLEX,
  CHASE_SAPPHIRE_PREFERRED,
  CITI_CUSTOM_CASH,
  CITI_DOUBLE_CASH,
  DISCOVER_IT,
  CHASE_AMAZON,
  AMEX_GOLD,
  WELLS_FARGO_PLATINUM,
  WELLS_FARGO_ACTIVE_CASH,
  // CITI_PREMIER,
} = process.env;

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.CHASE_AMAZON]: CHASE_AMAZON,
  [WALLET_ACCOUNT.CHASE_FREEDOM_FLEX]: CHASE_FREEDOM_FLEX,
  [WALLET_ACCOUNT.CHASE_SAPPHIRE_PREFERRED]: CHASE_SAPPHIRE_PREFERRED,
  [WALLET_ACCOUNT.WF_PLATINUM]: WELLS_FARGO_PLATINUM,
  [WALLET_ACCOUNT.WF_ACTIVE_CASH]: WELLS_FARGO_ACTIVE_CASH,
  [WALLET_ACCOUNT.CITI_CUSTOM_CASH]: CITI_CUSTOM_CASH,
  [WALLET_ACCOUNT.CITI_DOUBLE_CASH]: CITI_DOUBLE_CASH,
  // [WALLET_ACCOUNT.CITI_PREMIER]: CITI_PREMIER,
  [WALLET_ACCOUNT.DISCOVER_IT]: DISCOVER_IT,
  [WALLET_ACCOUNT.CAPITAL_ONE_VENTURE_X]: CAPITAL_ONE_VENTURE_X,
  [WALLET_ACCOUNT.AMEX_GOLD]: AMEX_GOLD,
};

const balanceDifference = (expected: string, actual: string): string => {
  const expectedInPennies = parseInt((expected || '').replace(/\D/g, ''), 10) / 100;
  const actualInPennies = parseInt((actual || '').replace(/\D/g, ''), 10) / 100;
  const difference = expectedInPennies - actualInPennies;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(difference);
};

export const verifyAccountBalance = async (
  actualBalances: Record<string, string>,
  balanceSheet: string[][],
): Promise<void> => {
  const expectedBalances = DailyTaskData.getExpectedBalances();
  await notifyOfNegativeBalance(balanceSheet, 'Personal');

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
