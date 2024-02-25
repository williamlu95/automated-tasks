import DashBoardPage from '../../../pageobjects/wallet-dashboard-page';
import { formatToDollars } from '../../../utils/currency-formatter';
import { Template } from './transactions';

export const addTransactionToWallet = async (transactions: Template[] = []): Promise<void> => {
  for (const transaction of transactions) {
    const { amount, walletAccountName, template } = transaction;

    await DashBoardPage.addRecord(
      template,
      walletAccountName,
      Math.abs(parseFloat(amount)).toString()
    );

    console.log(
      `Successfully added ${formatToDollars(Math.abs(parseFloat(amount)))} to ${walletAccountName}`
    );
  }
};
