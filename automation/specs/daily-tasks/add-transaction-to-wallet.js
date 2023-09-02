import DashBoardPage from '../../pageobjects/wallet-dashboard-page';
import { formatPenniesToDollars } from '../../utils/currency-formatter';

export const addTransactionToWallet = async (transactions = []) => {
  for (const transaction of transactions) {
    const { amount, walletAccountName, template } = transaction;
    await DashBoardPage.addRecord(template, walletAccountName, Math.abs(amount));
    console.log(`Successfully added ${formatPenniesToDollars(Math.abs(amount))} to ${walletAccountName}`);
    await browser.pause(5000);
  }
};
