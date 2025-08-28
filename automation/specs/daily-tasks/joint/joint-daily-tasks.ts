import { readPersonalEmails } from '../../../utils/notification';
import { JointTransactions } from './joint-transactions';
import { verifyJointBalances } from './verify-joint-balances';
// import WalletRecordPage from '../../../pageobjects/wallet-record-page';
// import { DailyTaskData } from '../daily-task-data';

export const runJointDailyTasks = async () => {
  readPersonalEmails(false);

  const transactions = new JointTransactions();
  transactions.initializeTransactions();

  // TODO: add back in once script is updated
  // const pendingTransactions = await WalletRecordPage.getPendingTransactions();

  // for (let i = pendingTransactions.length - 1; i >= 0; i -= 1) {
  //   const pendingTransaction = pendingTransactions[i];
  //   const isPresent = transactions.isPresent(pendingTransaction.date, pendingTransaction.amount);

  //   if (isPresent) {
  //     await WalletRecordPage.removeRecord(i);
  //   }
  // }

  // await DailyTaskData.refreshExpectedBalance();
  // transactions.initializeTransactions();
  await verifyJointBalances(transactions.getBalanceSheet());
};
