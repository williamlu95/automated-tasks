import { buildBalanceSheetHTML } from '../../utils/balance-html';
import { readJointEmails, sendEmail } from '../../utils/notification';
import { JointTransactions } from './joint-transactions';

const RUN_AT_HOUR = 16;

export const verifyJointBalances = async () => {
  if (RUN_AT_HOUR !== new Date().getHours()) {
    return;
  }

  readJointEmails(false);

  const transactions = new JointTransactions();
  await transactions.initializeTransactions();
  const balanceSheet = await transactions.getBalanceSheet();

  await sendEmail({
    subject: 'Joint Balance',
    text: 'Balances',
    html: buildBalanceSheetHTML(balanceSheet),
  });
};
