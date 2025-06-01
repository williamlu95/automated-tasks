import { notifyOfNegativeBalance } from '../../../utils/balance';
import { replaceSheetData } from '../../../utils/google-sheets';
import { readPersonalEmails } from '../../../utils/notification';
import { MothersTransactions } from './mothers-transactions';

const RUN_AT_HOUR = new Date().getHours(); // Change to specific hour to run only once a day

export const verifyMothersBalances = async () => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  readPersonalEmails(false);

  const transactions = new MothersTransactions();
  transactions.initializeTransactions();
  const balanceSheet = transactions.getBalanceSheet();
  await notifyOfNegativeBalance(balanceSheet, "Mother's");
  await replaceSheetData("Mother's Balance", balanceSheet);
};
