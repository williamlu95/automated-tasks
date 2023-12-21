import GoogleBalanceSheetPage from '../../../pageobjects/google-balance-sheet-page';
import { readJointEmails } from '../../../utils/notification';
import { JointTransactions } from './joint-transactions';

export const verifyJointBalances = async () => {
  readJointEmails(false);

  const transactions = new JointTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();

  await GoogleBalanceSheetPage.openJointBalanceSheet();
  await GoogleBalanceSheetPage.setBalances(balanceSheet);
};
