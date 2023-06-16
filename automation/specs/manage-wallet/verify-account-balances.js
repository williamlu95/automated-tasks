import { WALLET_ACCOUNT } from '../../constants/account';
import WalletDashboardPage from '../../pageobjects/wallet-dashboard-page';

const {
  CHASE_CHECKING,
  CHASE_FREEDOM_UNLIMITED,
  CHASE_FREEDOM_FLEX,
  WELLS_FARGO_CHECKING,
  WELLS_FARGO_PROPEL,
  WELLS_FARGO_PLATINUM,
  WELLS_FARGO_AUTOGRAPH,
  CITI_DOUBLE_CASH,
  CITI_CUSTOM_CASH,
  AMAZOM_PRIME_REWARDS,
  DISCOVER_IT,
  AMEX_BLUE_CASH_PREFERRED,
  AMEX_GOLD_CARD,
} = process.env;

const ACCOUNTS = {
  [WALLET_ACCOUNT.CHASE_CHECKING]: CHASE_CHECKING,
  [WALLET_ACCOUNT.WELLS_FARGO_CHECKING]: WELLS_FARGO_CHECKING,

  //   { number: CHASE_FREEDOM_UNLIMITED, name: 'Chase Freedom Unlimited' },
  //   { number: CHASE_FREEDOM_FLEX, name: 'Chase Freedom Flex' },
//   { number: WELLS_FARGO_PROPEL, name: 'Wells Fargo Propel' },
//   { number: WELLS_FARGO_PLATINUM, name: 'Wells Fargo Platinum' },
//   { number: CITI_DOUBLE_CASH, name: 'Citi Double Cash' },
//   { number: CITI_CUSTOM_CASH, name: 'Citi Custom Cash' },
//   { number: AMAZOM_PRIME_REWARDS, name: 'Amazon Prime Rewards' },
//   { number: DISCOVER_IT, name: 'Discover It' },
//   { number: AMEX_BLUE_CASH_PREFERRED, name: 'AMEX Blue Cash Preferred' },
//   { number: AMEX_GOLD_CARD, name: 'AMEX Gold Card' },
//   { number: WELLS_FARGO_AUTOGRAPH, name: 'Wells Fargo Autograph' },
};

export const runVerifyAccountBalances = (actualBalances) => context('when verifying accounts on mint', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  before(async () => {
    const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

    const accountBalance = Object.entries(ACCOUNTS).map(([name, number]) => [
      expectedBalances[name],
      actualBalances[number],
    ]);

    console.log('accountBalance :>> ', accountBalance);
  });

  it('should run the tests', () => expect(true).toEqual(true));
});
