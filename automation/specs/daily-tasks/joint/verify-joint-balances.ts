import { notifyOfNegativeBalance } from '../../../utils/balance';
import { replaceSheetData } from '../../../utils/google-sheets';
import { readPersonalEmails } from '../../../utils/notification';
import { JointTransactions } from './joint-transactions';

const RUN_AT_HOUR = new Date().getHours(); // Change to specific hour to run only once a day

export const verifyJointBalances = async () => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  readPersonalEmails(false);

  const transactions = new JointTransactions();
  transactions.initializeTransactions();
  const balanceSheet = transactions.getBalanceSheet();
  await notifyOfNegativeBalance(balanceSheet, 'Joint');
  await replaceSheetData('Joint Balance', balanceSheet);
};
