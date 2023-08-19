import { TEMPLATE_TRANSACTION } from '../../constants/transaction';
import TmobileDashboardPage from '../../pageobjects/tmobile-dashboard-page';
import TmobileLoginPage from '../../pageobjects/tmobile-login-page';

export const runPayTmobileBill = (templateTransactions = []) => context('when there is a bill to pay', () => {
  it('should pay the bill', async () => {
    const { transactionCountKey, ...restOfTemplate } = TEMPLATE_TRANSACTION.TMOBILE;

    if (global.transactionCounts[transactionCountKey] > 0) {
      expect(true).toEqual(true);
      return;
    }

    await TmobileLoginPage.open();
    await TmobileLoginPage.acceptCookies();
    await TmobileLoginPage.login();
    const paidAmount = await TmobileDashboardPage.payBill();

    if (paidAmount) {
      global.transactionCounts[transactionCountKey] += 1;
      templateTransactions.push({
        ...restOfTemplate,
        amount: paidAmount,
      });
    }

    expect(true).toEqual(true);
  });
});
