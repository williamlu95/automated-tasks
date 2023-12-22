import GoogleBalanceSheetPage from '../../../pageobjects/google-balance-sheet-page';
import { readJointEmails } from '../../../utils/notification';
import { JointTransactions } from './joint-transactions';

const RUN_AT_HOUR = new Date().getHours();

export const verifyJointBalances = async () => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  readJointEmails(false);

  const transactions = new JointTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();

  await GoogleBalanceSheetPage.openJointBalanceSheet();
  await GoogleBalanceSheetPage.setBalances(balanceSheet);
};
