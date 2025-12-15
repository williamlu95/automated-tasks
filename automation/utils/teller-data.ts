import csv from 'csvtojson';
import fs from 'fs';
import { DateTime } from 'luxon';
import {
  CHECKING_ACCOUNTS,
  getAccountBalance,
  getAccounts,
  getTransactions,
  TOKEN_TO_ACCOUNTS,
  TOKEN_TO_BANK,
} from './teller';
import { Transaction } from '../types/transaction';
import { formatToDollars } from './currency-formatter';
import { sendEmail } from './notification';

const DEFAULT_WAIT_TIME = 5000;

const CSV_HEADERS = ['date', 'account', 'description', 'amount'];

enum EnrollmentStatus {
  OK = 'ok',
  UNHEALTHY = 'unhealthy'
}

export class TellerData {
  private static TRANSACTION_FILE_LOCATION = './teller-transactions.csv';

  private static BALANCE_FILE_LOCATION = './teller-balances.json';

  private static ENROLLMENT_FILE_LOCATION = './teller-enrollments.json';

  private balances: Record<string, string> = {};

  private transactions: Transaction[] = [];

  private enrollments: Record<string, {id: string, status: EnrollmentStatus }> = {};

  // We want to add waits because Teller is secretive with rate limiting. To avoid 429's we just make requests very slowly
  private wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  async initializeFromApi() {
    try {
      await this.initializeFromLocal();
    } catch (err) {
      console.warn('Could not initialize from local, starting from empty state.');
    }

    const tokenEntries = Object.entries(TOKEN_TO_ACCOUNTS);
    for (const tokenEntry of tokenEntries) {
      const [token, accounts] = tokenEntry;
      try {
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

        const [firstAccount] = tellerAccounts;
        const enrollmentId = firstAccount?.enrollment_id || '';
        const bankName = TOKEN_TO_BANK[token];
        this.enrollments[bankName] = { id: enrollmentId, status: EnrollmentStatus.OK };
      } catch (err) {
        console.error(`Intialization failed for token ${token}`, err);
        const bankName = TOKEN_TO_BANK[token];
        if (this.enrollments[bankName]) {
          this.enrollments[bankName].status = EnrollmentStatus.UNHEALTHY;
        }
      }
    }

    this.saveResults();

    const failedAccounts = Object.entries(this.enrollments).filter((e) => e[1].status === EnrollmentStatus.UNHEALTHY).map((e) => e[0]);
    if (failedAccounts.length > 0) {
      await sendEmail({
        subject: 'ACTION REQUIRED: Fix Unhealthy Accounts',
        html: `<h1><strong>The following accounts are unhealthy, please fix the connection in the Teller Console: </strong><ul>${failedAccounts.map((a) => `<li>${a}</li>`).join('')}</ul></h1>`,
      });
    }
  }

  async initializeFromLocal() {
    try {
      this.balances = JSON.parse(fs.readFileSync(TellerData.BALANCE_FILE_LOCATION).toString());
      this.enrollments = JSON.parse(fs.readFileSync(TellerData.ENROLLMENT_FILE_LOCATION).toString());
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
    fs.writeFileSync(TellerData.ENROLLMENT_FILE_LOCATION, JSON.stringify(this.enrollments, null, 4), 'utf8');

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
      const amount = isCheckingAccount ? balance.available || '0' : balance.ledger || '0';
      const balanceAmount = isCheckingAccount ? amount : `-${amount}`;
      this.balances[account] = formatToDollars(balanceAmount);
      this.transactions = this.transactions.filter((t) => t.account !== account);
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
