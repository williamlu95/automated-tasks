import { DateTime } from 'luxon';
import { Transaction } from '../../types/transaction';
import WalletDashboardPage from '../../pageobjects/wallet-dashboard-page';
import WalletRecordPage from '../../pageobjects/wallet-record-page';
import SofiExportTransactionPage from '../../pageobjects/sofi-export-transaction-page';
import { TellerData } from '../../utils/teller-data';

export class DailyTaskData {
  // eslint-disable-next-line no-use-before-define
  private static instance: DailyTaskData = new DailyTaskData();

  private jointGrocerySpend: number = 0;

  private transactions: Transaction[] = [];

  private actualBalances: Record<string, string> = {};

  private expectedBalances: Record<string, string> = {};

  private transactionCounts: Record<string, number> = {};

  static async initializeTransactions() {
    const tellerAggregator = new TellerData();
    await tellerAggregator.initializeFromLocal();

    DailyTaskData.instance.transactions = [...tellerAggregator.getTransactions(), ...await SofiExportTransactionPage.getTransactions()]
      .sort((a, b) => DateTime.fromFormat(b.date, 'MM/dd/yyyy').toMillis() - DateTime.fromFormat(a.date, 'MM/dd/yyyy').toMillis());
    console.log(`Transactions: ${JSON.stringify(DailyTaskData.instance.transactions, null, 4)}`);

    DailyTaskData.instance.actualBalances = { ...tellerAggregator.getBalances(), ...await SofiExportTransactionPage.getBalance() };
    console.log(`Actual Balances: ${JSON.stringify(DailyTaskData.instance.actualBalances, null, 4)}`);

    DailyTaskData.instance.expectedBalances = await WalletDashboardPage.loginAndGetAllAccountBalances();
    console.log(`Expected Balances: ${JSON.stringify(DailyTaskData.instance.expectedBalances, null, 4)}`);

    DailyTaskData.instance.jointGrocerySpend = await WalletRecordPage.getGrocerySpend();
    console.log('Grocery Spend: ', DailyTaskData.instance.jointGrocerySpend);

    DailyTaskData.instance.transactionCounts = await WalletRecordPage.getTransactionCounts();
    console.log(`Transaction Counts: ${JSON.stringify(DailyTaskData.instance.transactionCounts, null, 4)}`);
  }

  static async refreshExpectedBalance() {
    await WalletDashboardPage.open();
    DailyTaskData.instance.expectedBalances = await WalletDashboardPage.getAllAccountBalances();
    console.log(`Refreshed Expected Balances: ${JSON.stringify(DailyTaskData.instance.expectedBalances, null, 4)}`);
  }

  public static getInstance() {
    return DailyTaskData.instance;
  }

  public static getTransactions() {
    return DailyTaskData.instance.transactions;
  }

  public static getActualBalances() {
    return DailyTaskData.instance.actualBalances;
  }

  public static getExpectedBalances() {
    return DailyTaskData.instance.expectedBalances;
  }

  public static getJointGrocerySpend() {
    return DailyTaskData.instance.jointGrocerySpend;
  }

  public static getTransactionCounts() {
    return DailyTaskData.instance.transactionCounts;
  }
}
