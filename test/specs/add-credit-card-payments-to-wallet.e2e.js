import LoginPage from '../pageobjects/wallet-login-page';
import DashBoardPage from '../pageobjects/wallet-dashboard-page';
import { getCreditCardTransactions, CREDIT_CARD_TRANSACTION, BANK_NAME } from '../plaid/plaid-api';

const CREDIT_CARD_ACCOUNT = {
  CHASE_FREEDOM_UNLIMITED: 'Chase Freedom Unlimited',
  CHASE_FREEDOM_FLEX: 'Chase Freedom Flex',
  WELLS_FARGO_PROPEL: 'Wells Fargo Propel',
  WELLS_FARGO_PLATINUM: 'Wells Fargo Platinum',
  CITI_DOUBLE_CASH: 'Citi Double Cash',
  CITI_CUSTOM_CASH: 'Citi Custom Cash',
  AMAZON_PRIME_REWARDS: 'Amazon Prime Rewards Visa Signature',
  DISCOVER_IT: 'Discover It',
  AMEX_BLUE_CASH: 'American Express Blue Cash Preferred',
  AMEX_GOLD_CARD: 'American Express Gold Card',
};

const TODAY = new Date();

const CUSTOM_CASH_AUTOPAY_DAY = 22;
const DOUBLE_CASH_AUTOPAY_DAY = 2;

const AMEX_BLUE_CASH_DAY = 28;
const AMEX_GOLD_CARD_DAY = 7;

const AMAZON_PRIME_REWARDS_AUTOPAY_DAY = 15;
const CHASE_FREEDOM_FLEX_AUTOPAY_DAY = 20;
const CHASE_FREEDOM_UNLIMITED_AUTOPAY_DAY = 26;

const getCitiAccount = () => {
  const customCashDate = new Date();
  customCashDate.setDate(CUSTOM_CASH_AUTOPAY_DAY);

  const doubleCashDate = new Date();
  doubleCashDate.setDate(DOUBLE_CASH_AUTOPAY_DAY);

  const customDiff = Math.abs(TODAY - customCashDate);
  const doubleDiff = Math.abs(TODAY - doubleCashDate);

  return customDiff < doubleDiff
    ? CREDIT_CARD_ACCOUNT.CITI_CUSTOM_CASH
    : CREDIT_CARD_ACCOUNT.CITI_DOUBLE_CASH;
};

const getAmexAccount = () => {
  const blueCashDate = new Date();
  blueCashDate.setDate(AMEX_BLUE_CASH_DAY);

  const goldCardDate = new Date();
  goldCardDate.setDate(AMEX_GOLD_CARD_DAY);

  const blueDiff = Math.abs(TODAY - blueCashDate);
  const goldDiff = Math.abs(TODAY - goldCardDate);

  return blueDiff < goldDiff
    ? CREDIT_CARD_ACCOUNT.AMEX_BLUE_CASH
    : CREDIT_CARD_ACCOUNT.AMEX_GOLD_CARD;
};

const getChaseAccount = () => {
  const amazonPrimeRewardsDate = new Date();
  amazonPrimeRewardsDate.setDate(AMAZON_PRIME_REWARDS_AUTOPAY_DAY);

  const chaseFreedomFlexDate = new Date();
  chaseFreedomFlexDate.setDate(CHASE_FREEDOM_FLEX_AUTOPAY_DAY);

  const chaseFreedomUnlimitedDate = new Date();
  chaseFreedomUnlimitedDate.setDate(CHASE_FREEDOM_UNLIMITED_AUTOPAY_DAY);

  const amazonDiff = Math.abs(TODAY - amazonPrimeRewardsDate);
  const flexDiff = Math.abs(TODAY - chaseFreedomFlexDate);
  const unlimitedDiff = Math.abs(TODAY - chaseFreedomUnlimitedDate);

  const closestDate = Math.min(amazonDiff, flexDiff, unlimitedDiff);

  switch (closestDate) {
    case amazonDiff:
      return CREDIT_CARD_ACCOUNT.AMAZON_PRIME_REWARDS;
    case flexDiff:
      return CREDIT_CARD_ACCOUNT.CHASE_FREEDOM_FLEX;
    case unlimitedDiff:
      return CREDIT_CARD_ACCOUNT.CHASE_FREEDOM_UNLIMITED;
    default:
      return '';
  }
};

const getAccount = (name) => {
  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.AMAZON_PRIME_REWARDS)) {
    return CREDIT_CARD_ACCOUNT.AMAZON_PRIME_REWARDS;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.CHASE_FREEDOM_UNLIMITED)) {
    return CREDIT_CARD_ACCOUNT.CHASE_FREEDOM_UNLIMITED;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.CHASE_FREEDOM_FLEX)) {
    return CREDIT_CARD_ACCOUNT.CHASE_FREEDOM_FLEX;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.DISCOVER_IT)) {
    return CREDIT_CARD_ACCOUNT.DISCOVER_IT;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.WELLS_FARGO_PROPEL)) {
    return CREDIT_CARD_ACCOUNT.WELLS_FARGO_PROPEL;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.WELLS_FARGO_PLATINUM)) {
    return CREDIT_CARD_ACCOUNT.WELLS_FARGO_PLATINUM;
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.AMEX)) {
    return getAmexAccount();
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.CHASE)) {
    return getChaseAccount();
  }

  if (name.toUpperCase().includes(CREDIT_CARD_TRANSACTION.CITI)) {
    return getCitiAccount();
  }

  return null;
};

describe('Add credit card payments to wallet', () => {
  const transactions = [];

  const runTransactionContext = () => context('when there are credit card transactions', () => {
    afterEach(async () => {
      await browser.pause(5000);
    });

    transactions.forEach(({ amount, account }) => context(`when transfering ${Math.abs(amount)} to ${account}`, () => {
      it(`should make the transfer from chase checking to ${account}`, async () => {
        if (!account) {
          expect(true).toEqual(true);
          return;
        }

        const initalBalance = await DashBoardPage.accountCards[0].getText();
        await DashBoardPage.addTransferFromChase(account, Math.abs(amount));
        const actualBalance = await DashBoardPage.accountCards[0].getText();
        const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) - Math.abs(amount);

        expect(actualBalance).toContain(
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
        );
      });
    }));
  });

  before(async () => {
    const chaseTransactions = await getCreditCardTransactions(BANK_NAME.CHASE);

    chaseTransactions.forEach(({ amount, name }) => {
      transactions.push({
        amount, account: getAccount(name),
      });
    });

    if (transactions.length) {
      await LoginPage.open();
      await LoginPage.login();
      runTransactionContext();
    }
  });

  context('when the tests need to run', () => {
    it('should run the tests', () => expect(true).toEqual(true));
  });
});
