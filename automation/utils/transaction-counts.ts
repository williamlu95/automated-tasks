import * as fs from 'fs';
import { getMonth } from 'date-fns';
import { downloadDir } from './file';

const TRANSACTION_COUNT_FILE = './counts.json';

export class TransactionCounts {
  // eslint-disable-next-line no-use-before-define
  private static instance: TransactionCounts;

  private counts: Record<string, number> = {};

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    this.initializeTransactionCounts();
  }

  private initializeTransactionCounts() {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    const currentMonth = getMonth(new Date());
    this.counts = JSON.parse(fs.readFileSync(TRANSACTION_COUNT_FILE).toString());

    if (currentMonth !== this.counts.month) {
      Object.keys(this.counts).forEach((key) => {
        this.counts[key] = key === 'month' ? currentMonth : 0;
      });

      fs.writeFileSync(TRANSACTION_COUNT_FILE, JSON.stringify(this.counts, null, 4), 'utf8');
    }
  }

  private getCounts(): Record<string, number> {
    return this.counts;
  }

  private addToTransactionCount(amount: number, transactionCountKey: string): void {
    this.counts[transactionCountKey] += amount;
  }

  private setTransactionCount(amount: number, transactionCountKey: string): void {
    this.counts[transactionCountKey] = amount;
  }

  public static getInstance(): TransactionCounts {
    if (!TransactionCounts.instance) {
      TransactionCounts.instance = new TransactionCounts();
    }

    return TransactionCounts.instance;
  }

  public static updateCountsFile(): void {
    const counts = this.getInstance().getCounts();
    fs.writeFileSync(TRANSACTION_COUNT_FILE, JSON.stringify(counts, null, 4), 'utf8');
  }

  public static getTransactionCount(transactionCountKey: string): number {
    const counts = this.getInstance().getCounts();
    return counts[transactionCountKey] || 0;
  }

  public static getTransactionMonth(): number {
    const counts = this.getInstance().getCounts();
    return counts.month;
  }

  public static addToTransactionCount(amount: number, transactionCountKey: string): void {
    const transactionCounts = this.getInstance();
    transactionCounts.addToTransactionCount(amount, transactionCountKey);
  }

  public static setTransactionCount(amount: number, transactionCountKey: string): void {
    const transactionCounts = this.getInstance();
    transactionCounts.setTransactionCount(amount, transactionCountKey);
  }
}
