import { formatFromDollars, formatToDollars } from './currency-formatter';
import { sendEmail } from './notification';

export const OVERALL_FORMULA = '=INDIRECT("C" & ROW()) + INDIRECT("D" & ROW() - 1)';
export const INITIAL_FORMULA = '=INDIRECT("C" & ROW())';

export const notifyOfNegativeBalance = async (balanceSheet: string[][], account: string) => {
  if (!balanceSheet.length) {
    return;
  }

  const initialBalance = formatFromDollars(balanceSheet[0][2]);
  let outstandingBalance = initialBalance;
  let min = initialBalance;

  balanceSheet.slice(1).forEach((balance) => {
    const value = formatFromDollars(balance[2]);
    outstandingBalance += value;
    min = Math.min(outstandingBalance, min);
  });

  if (min <= 0 && process.env.ENABLE_NEGATIVE_BALANCE_EMAIL) {
    await sendEmail({
      subject: `ACTION REQUIRED: Negative Balance for ${account} Account`,
      html: `<h1><strong>Negative Balance: </strong><span style="color: red;">${formatToDollars(
        min,
      )}</span></h1>`,
    });
  }
};
