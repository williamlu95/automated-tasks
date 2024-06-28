import * as fs from 'fs';
import { downloadDir } from './file';

const TRANSACTION_COUNT_FILE = './counts.json';

export class ErrorCounts {
  // eslint-disable-next-line no-use-before-define
  private static instance: ErrorCounts;

  private static FAILED_ATTEMPTS_KEY = 'failedAttempts';

  private counts: Record<string, number> = {};

  // eslint-disable-next-line no-useless-constructor
  private constructor() {
    this.initializeTransactionCounts();
  }

  private initializeTransactionCounts() {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    this.counts = JSON.parse(fs.readFileSync(TRANSACTION_COUNT_FILE).toString());
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

  public static getInstance(): ErrorCounts {
    if (!ErrorCounts.instance) {
      ErrorCounts.instance = new ErrorCounts();
    }

    return ErrorCounts.instance;
  }

  public static updateCountsFile(): void {
    const counts = this.getInstance().getCounts();
    fs.writeFileSync(TRANSACTION_COUNT_FILE, JSON.stringify(counts, null, 4), 'utf8');
  }

  public static getFailedCount(): number {
    const counts = this.getInstance().getCounts();
    return counts[this.FAILED_ATTEMPTS_KEY] || 0;
  }

  public static getTransactionMonth(): number {
    const counts = this.getInstance().getCounts();
    return counts.month;
  }

  public static addToFailedCount(amount: number): void {
    const transactionCounts = this.getInstance();
    transactionCounts.addToTransactionCount(amount, this.FAILED_ATTEMPTS_KEY);
  }

  public static setFailedCount(amount: number): void {
    const transactionCounts = this.getInstance();
    transactionCounts.setTransactionCount(amount, this.FAILED_ATTEMPTS_KEY);
  }
}
