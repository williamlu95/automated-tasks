import { replaceSheetData } from '../../../utils/google-sheets';
import { readMothersEmails } from '../../../utils/notification';
import { MothersTransactions } from './mothers-transactions';

const RUN_AT_HOUR = new Date().getHours(); // Change to specific hour to run only once a day

export const verifyMothersBalances = async () => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  readMothersEmails(false);

  const transactions = new MothersTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();
  replaceSheetData("Mother's Balance", balanceSheet);
};
