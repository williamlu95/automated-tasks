import { TEMPLATE_TRANSACTION } from '../../constants/transaction';
import TmobileDashboardPage from '../../pageobjects/tmobile-dashboard-page';
import TmobileLoginPage from '../../pageobjects/tmobile-login-page';
import { TransactionCounts } from '../../utils/transaction-counts';
import { Template } from './transactions';

const hasNoBalance = (transactionCountKey: string): boolean => {
  const isAlreadyPaid = TransactionCounts.getTransactionCount(transactionCountKey) > 0;

  if (isAlreadyPaid) {
    return true;
  }

  const isBeforeBillDate = new Date().getDate() < 25;

  if (isBeforeBillDate) {
    return true;
  }

  return false;
};

export const payTmobileBill = async (): Promise<Template[]> => {
  const { transactionCountKey, ...restOfTemplate } = TEMPLATE_TRANSACTION.TMOBILE;

  if (hasNoBalance(transactionCountKey)) {
    return [];
  }

  await TmobileLoginPage.open();
  await TmobileLoginPage.acceptCookies();
  await TmobileLoginPage.login();
  const paidAmount = await TmobileDashboardPage.payBill();

  if (!paidAmount) {
    return [];
  }

  console.log(`Successfully paid ${paidAmount} to T-Mobile`);
  TransactionCounts.addToTransactionCount(1, transactionCountKey);
  return [{
    walletAccountName: restOfTemplate.walletAccountName,
    template: restOfTemplate.template,
    type: restOfTemplate.type,
    amount: paidAmount,
  }];
};
