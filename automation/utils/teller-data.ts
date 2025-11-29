import csv from 'csvtojson';
import fs from 'fs';
import { DateTime } from 'luxon';
import {
  CHECKING_ACCOUNTS,
  getAccountBalance,
  getAccounts,
  getTransactions,
  TOKEN_TO_ACCOUNTS,
} from './teller';
import { Transaction } from '../types/transaction';
import { formatToDollars } from './currency-formatter';

const DEFAULT_WAIT_TIME = 5000;

const CSV_HEADERS = ['date', 'account', 'description', 'amount'];

export class TellerData {
  private static TRANSACTION_FILE_LOCATION = './teller-transactions.csv';

  private static BALANCE_FILE_LOCATION = './teller-balances.json';

  private balances: Record<string, string> = {};

  private transactions: Transaction[] = [];

  // We want to add waits because Teller is secretive with rate limiting. To avoid 429's we just make requests very slowly
  private wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  async initializeFromApi() {
    const tokenEntries = Object.entries(TOKEN_TO_ACCOUNTS);
    for (const tokenEntry of tokenEntries) {
      const [token, accounts] = tokenEntry;
      console.log(`Fetching accounts for token: ${token}`);
      const tellerAccounts = await getAccounts(token);
      const accountToTellerAccount = Object.fromEntries(tellerAccounts.map((ta) => [ta.last_four, ta.id]));
      console.log(`Receieved Accounts: ${tellerAccounts.map((ta) => ta.last_four).join(', ')}`);
      const isMissingTellerAccount = accounts.filter((account) => !accountToTellerAccount[account]);

      if (isMissingTellerAccount.length > 0) {
        throw Error(`The following accounts are missing from the teller accounts API: ${isMissingTellerAccount.join(', ')}`);
      }

      await this.wait(DEFAULT_WAIT_TIME);
      await this.initBalancesAndTransactions(token, accountToTellerAccount);
      this.saveResults();
    }
  }

  async initializeFromLocal() {
    try {
      this.balances = JSON.parse(fs.readFileSync(TellerData.BALANCE_FILE_LOCATION).toString());
      this.transactions = await csv({ headers: CSV_HEADERS }).fromFile(
        TellerData.TRANSACTION_FILE_LOCATION,
      );
    } catch (err) {
      console.error('Could not read from permanent file', err);
      throw Error('Could not read Teller Data ending script early');
    }
  }

  private saveResults() {
    fs.writeFileSync(TellerData.BALANCE_FILE_LOCATION, JSON.stringify(this.balances, null, 4), 'utf8');

    const csvContent = [`${CSV_HEADERS.join(',')}`];

    this.transactions.forEach((row: Record<string, string>) => {
      const values = CSV_HEADERS.map((header) => row[header.toLowerCase()]);
      csvContent.push(`${values.join(',')}`);
    });

    fs.writeFileSync(TellerData.TRANSACTION_FILE_LOCATION, csvContent.join('\n'));
  }

  private async initBalancesAndTransactions(token: string, accountToTellerAccount: Record<string, string>) {
    const entries = Object.entries(accountToTellerAccount);
    for (const accountAndTellerAccount of entries) {
      const [account, tellerAccount] = accountAndTellerAccount;
      console.log(`Fetching balance for account: ${account}`);
      const balance = await getAccountBalance(token, tellerAccount);
      console.log(`Recieved balance of: ${balance.ledger}`);
      await this.wait(DEFAULT_WAIT_TIME);
      console.log(`Fetching transactions for account: ${account}`);
      const transactions = await getTransactions(token, tellerAccount, DateTime.now().minus({ month: 1 }).set({ day: 1 }).toISODate());
      console.log(`Recieved ${transactions.length} transactions`);
      await this.wait(DEFAULT_WAIT_TIME);
      const isCheckingAccount = CHECKING_ACCOUNTS.includes(account);
      const amount = balance.ledger || '0';
      const balanceAmount = isCheckingAccount ? amount : `-${amount}`;
      this.balances[account] = formatToDollars(balanceAmount);
      this.transactions = this.transactions.concat(transactions.map((t) => ({
        date: t.date,
        account,
        description: t.description,
        amount: t.amount,
      })));
    }
  }

  public getTransactions() {
    return this.transactions;
  }

  public getBalances() {
    return this.balances;
  }
}
