import LoginPage from '../pageobjects/wallet-login-page';
import DashBoardPage from '../pageobjects/wallet-dashboard-page';
import { WALLET_ACCOUNT, BANK_NAME, TEMPLATE_TYPE } from '../constants/account';

const getPayrollTransactions = async (bank) => (
  bank === BANK_NAME.WELLS_FARGO
    ? [{ type: BANK_NAME.WELLS_FARGO, amount: 2.00 }]
    : [{ type: BANK_NAME.CHASE, amount: 3.00 }]);

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
        const accountCardName = template === TEMPLATE_TYPE.CHASE_INCOME
          ? WALLET_ACCOUNT.CHASE_CHECKING
          : WALLET_ACCOUNT.WELLS_FARGO_CHECKING;

        const initalBalance = await DashBoardPage.getBalanceByName(accountCardName);
        await DashBoardPage.addRecord(template, Math.abs(amount));
        const actualBalance = await DashBoardPage.getBalanceByName(accountCardName);
        const expectedBalance = (parseInt(initalBalance.replace(/\D/g, ''), 10) / 100) + Math.abs(amount);

        expect(actualBalance).toContain(
          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expectedBalance),
        );
      });
    }));
  });

  before(async () => {
    const [wellsFargoTransactions, chaseTransactions] = await Promise.all([
      getPayrollTransactions(BANK_NAME.WELLS_FARGO),
      getPayrollTransactions(BANK_NAME.CHASE),
    ]);

    wellsFargoTransactions.forEach(({ amount }) => {
      transactions.push({
        amount, type: BANK_NAME.WELLS_FARGO,
      });
    });

    chaseTransactions.forEach(({ amount }) => {
      transactions.push({
        amount, type: BANK_NAME.CHASE,
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
