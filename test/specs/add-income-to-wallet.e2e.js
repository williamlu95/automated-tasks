import LoginPage from '../pageobjects/wallet-login-page';
import DashBoardPage from '../pageobjects/wallet-dashboard-page';
import { TEMPLATE_TYPE } from '../pageobjects/add-record-modal';
import { getPayrollTransactions } from '../plaid/plaid-api';

const {
  WALLET_LOGIN,
  WALLET_PASSWORD,
  CHASE_CHECKING_ID,
  WELLS_FARGO_CHECKING_ID,
} = process.env;

const BANK_TYPE = {
  CHASE: 'chase',
  WELLS_FARGO: 'wellsFargo',
};

const BANK_TEXT = {
  [BANK_TYPE.CHASE]: {
    template: TEMPLATE_TYPE.CHASE_INCOME,
  },
  [BANK_TYPE.WELLS_FARGO]: {
    template: TEMPLATE_TYPE.WELLS_FARGO_INCOME,
  },
};

describe('Add income to wallet', () => {
  const transactions = [];

  const runTransactionContext = () => context('when there are payroll transactions', () => {
    afterEach(async () => {
      await browser.pause(5000);
    });

    transactions.forEach(({ amount, type }) => context(`when adding ${Math.abs(amount)} to ${type}`, () => {
      it(`should add the income to the ${type} balance`, async () => {
        const { template } = BANK_TEXT[type];
        const accountCardIndex = template === TEMPLATE_TYPE.CHASE_INCOME ? 0 : 3;
        const initalBalance = await DashBoardPage.accountCards[accountCardIndex].getText();
        await DashBoardPage.addRecord(template, Math.abs(amount));
        const actualBalance = await DashBoardPage.accountCards[accountCardIndex].getText();
        const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount);

        expect(actualBalance).toContain(
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
        );
      });
    }));
  });

  before(async () => {
    const [wellsFargoTransactions, chaseTransactions] = await Promise.all([
      getPayrollTransactions(process.env.WELLS_FARGO_ACCESS_TOKEN, [WELLS_FARGO_CHECKING_ID]),
      getPayrollTransactions(process.env.CHASE_ACCESS_TOKEN, [CHASE_CHECKING_ID]),
    ]);

    wellsFargoTransactions.forEach(({ amount }) => {
      transactions.push({
        amount, type: BANK_TYPE.WELLS_FARGO,
      });
    });

    chaseTransactions.forEach(({ amount }) => {
      transactions.push({
        amount, type: BANK_TYPE.CHASE,
      });
    });

    if (transactions.length) {
      await LoginPage.open();
      await LoginPage.login(WALLET_LOGIN, WALLET_PASSWORD);
      runTransactionContext();
    }
  });

  context('when the tests need to run', () => {
    it('should run the tests', () => expect(true).toEqual(true));
  });
});
