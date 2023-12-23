import GoogleBalanceSheetPage from '../../../pageobjects/google-balance-sheet-page';
import { readMothersEmails } from '../../../utils/notification';
import { MothersTransactions } from './mothers-transactions';

const RUN_AT_HOUR = 20;

export const verifyMothersBalances = async () => {
  // if (RUN_AT_HOUR !== new Date().getHours()) {
  //   return;
  // }

  readMothersEmails(false);

  const transactions = new MothersTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();

  await GoogleBalanceSheetPage.openMothersBalanceSheet();
  await GoogleBalanceSheetPage.setBalances(balanceSheet);
};
