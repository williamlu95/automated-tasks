import LoginPage from '../pageobjects/wallet-login-page';
import DashBoardPage from '../pageobjects/wallet-dashboard-page';
import { TEMPLATE_TYPE } from '../pageobjects/add-record-modal';
import { BANK_NAME, getPayrollTransactions } from '../plaid/plaid-api';

const BANK_TEXT = {
  [BANK_NAME.CHASE]: {
    template: TEMPLATE_TYPE.CHASE_INCOME,
  },
  [BANK_NAME.WELLS_FARGO]: {
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
    const [wellsFargoTransactions] = await Promise.all([
      getPayrollTransactions(BANK_NAME.WELLS_FARGO),
    ]);

    wellsFargoTransactions.forEach(({ amount }) => {
      transactions.push({
        amount, type: BANK_NAME.WELLS_FARGO,
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
