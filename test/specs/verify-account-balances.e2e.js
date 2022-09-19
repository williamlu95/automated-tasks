import MintLoginPage from '../pageobjects/mint-login-page';
import MintTransactionPage from '../pageobjects/mint-transaction-page';
import WalletLoginPage from '../pageobjects/wallet-login-page';
import WalletDashboardPage from '../pageobjects/wallet-dashboard-page';
import BalanceSheetPage from '../pageobjects/balance-sheet-page';

const {
  CHASE_CHECKING,
  CHASE_FREEDOM_UNLIMITED,
  CHASE_FREEDOM_FLEX,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_PROPEL,
  WELLS_FARGO_PLATINUM,
  CITI_DOUBLE_CASH,
  CITI_CUSTOM_CASH,
  AMAZOM_PRIME_REWARDS,
  DISCOVER_IT,
  AMEX_BLUE_CASH_PREFERRED,
  AMEX_GOLD_CARD,
} = process.env;

const ACCOUNTS = [
  { number: CHASE_CHECKING, name: 'Chase Checking' },
  { number: CHASE_FREEDOM_UNLIMITED, name: 'Chase Freedom Unlimited' },
  { number: CHASE_FREEDOM_FLEX, name: 'Chase Freedom Flex' },
  { number: WELLS_FARGO_CHECKING, name: 'Wells Fargo Checking' },
  { number: WELLS_FARGO_PROPEL, name: 'Wells Fargo Propel' },
  { number: WELLS_FARGO_PLATINUM, name: 'Wells Fargo Platinum' },
  { number: CITI_DOUBLE_CASH, name: 'Citi Double Cash' },
  { number: CITI_CUSTOM_CASH, name: 'Citi Custom Cash' },
  { number: AMAZOM_PRIME_REWARDS, name: 'Amazon Prime Rewards' },
  { number: DISCOVER_IT, name: 'Discover It' },
  { number: AMEX_BLUE_CASH_PREFERRED, name: 'AMEX Blue Cash Preferred' },
  { number: AMEX_GOLD_CARD, name: 'AMEX Gold Card' },
];

describe('Verify balances in wallet', () => {
  context('when verifying accounts on mint', () => {
    before(async () => {
      await MintLoginPage.open();
      await MintLoginPage.login();
      const actualBalances = await MintTransactionPage.getAllAccountBalances();

      await WalletLoginPage.open();
      await WalletLoginPage.login();
      const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

      const accountBalance = ACCOUNTS.map((account, index) => [
        expectedBalances[index],
        actualBalances[account.number],
      ]);

      await BalanceSheetPage.openAndLogin();
      await BalanceSheetPage.setBalances(accountBalance);
    });

    it('should run the tests', () => expect(true).toEqual(true));
  });
});
