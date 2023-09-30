import { buildBalanceSheetHTML } from '../../utils/balance-html';
import { readMothersEmails, sendEmail } from '../../utils/notification';
import { MothersTransactions } from './mothers-transactions';

export const verifyMothersBalances = async () => {
  readMothersEmails(false);

  const transactions = new MothersTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();

  await sendEmail({
    subject: 'Mother\'s Balance',
    text: 'Balances',
    html: buildBalanceSheetHTML(balanceSheet),
  });
};
