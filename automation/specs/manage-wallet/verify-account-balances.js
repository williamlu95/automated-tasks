import { WALLET_ACCOUNT } from '../../constants/account';
import WalletDashboardPage from '../../pageobjects/wallet-dashboard-page';

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

export const runVerifyAccountBalances = (actualBalances) => context('when verifying accounts on mint', () => {
  afterEach(async () => {
    await browser.pause(5000);
  });

  before(async () => {
    const expectedBalances = await WalletDashboardPage.getAllAccountBalances();

    const accountBalance = Object.entries(ACCOUNTS).map(([name, number]) => ({
      accountName: name,
      expectedBalance: expectedBalances[name],
      actualBalance: actualBalances[number],
    }));

    console.log('accountBalance :>> ', accountBalance);
  });

  it('should run the tests', () => expect(true).toEqual(true));
});
