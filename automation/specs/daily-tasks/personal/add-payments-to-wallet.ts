import DashBoardPage from '../../../pageobjects/wallet-dashboard-page';
import { formatToDollars } from '../../../utils/currency-formatter';
import { AutoPay } from './personal-transactions';

export const addPaymentsToWallet = async (transactions: AutoPay[] = []): Promise<void> => {
  await DashBoardPage.open();
  for (const transaction of transactions) {
    const { fromAccount, toAccount, amount } = transaction;
    await DashBoardPage.addTransfer(fromAccount, toAccount, Math.abs(parseFloat(amount)));
    console.log(
      `Successfully paid ${formatToDollars(
        Math.abs(parseFloat(amount)),
      )} from ${fromAccount} to ${toAccount}`,
    );
  }
};
