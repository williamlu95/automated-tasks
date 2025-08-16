import { notifyOfNegativeBalance } from '../../../utils/balance';
import { replaceSheetData } from '../../../utils/google-sheets';

const RUN_AT_HOUR = new Date().getHours(); // Change to specific hour to run only once a day

export const verifyJointBalances = async (balanceSheet: string[][]) => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  await notifyOfNegativeBalance(balanceSheet, 'Joint');
  await replaceSheetData('Joint Balance', balanceSheet);
};
