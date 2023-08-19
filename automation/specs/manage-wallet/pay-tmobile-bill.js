import { TEMPLATE_TRANSACTION } from '../../constants/transaction';
import TmobileDashboardPage from '../../pageobjects/tmobile-dashboard-page';
import TmobileLoginPage from '../../pageobjects/tmobile-login-page';

export const payTmobileBill = async () => {
  const { transactionCountKey, ...restOfTemplate } = TEMPLATE_TRANSACTION.TMOBILE;

  if (global.transactionCounts[transactionCountKey] > 0) {
    return [];
  }

  await TmobileLoginPage.open();
  await TmobileLoginPage.acceptCookies();
  await TmobileLoginPage.login();
  const paidAmount = await TmobileDashboardPage.payBill();

  if (!paidAmount) {
    return [];
  }

  global.transactionCounts[transactionCountKey] += 1;
  return [{
    ...restOfTemplate,
    amount: paidAmount,
  }];
};
