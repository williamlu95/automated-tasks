import DashBoardPage from '../../pageobjects/wallet-dashboard-page';
import { formatPenniesToDollars } from '../../utils/currency-formatter';

export const addPaymentsToWallet = async (transactions = []) => {
  for (const transaction of transactions) {
    const { fromAccount, toAccount, amount } = transaction;
    await DashBoardPage.addTransfer(fromAccount, toAccount, Math.abs(amount));
    console.log(`Successfully paid ${formatPenniesToDollars(Math.abs(amount))} from ${fromAccount} to ${toAccount}`);
    await browser.pause(5000);
  }
};
