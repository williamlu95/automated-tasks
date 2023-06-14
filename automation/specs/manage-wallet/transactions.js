import csv from 'csvtojson';
import { getMonth } from 'date-fns';
import { BANK_NAME } from '../../constants/account';
import MintLoginPage from '../../pageobjects/mint-login-page';
import MintTransactionPage from '../../pageobjects/mint-transaction-page';

const TRANSACTION_HEADERS = Object.freeze(['date', 'description', 'originalDescription', 'amount', 'type', 'category', 'account', 'labels', 'notes']);
const PAYROLL_NAME = 'BETTERLESSON';

const ACCOUNT_NAME = Object.freeze({
  'TOTAL CHECKING': BANK_NAME.CHASE,
  'Wells Fargo College Checking®': BANK_NAME.WELLS_FARGO,
});

export class Transactions {
  constructor() {
    this.incomeTransactions = [];
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    const transactionsForCurrentMonth = transactions.filter((t) => {
      const transactionMonth = getMonth(new Date(t.date)) + 1;
      return transactionMonth === global.transactionCounts.month;
    });

    transactionsForCurrentMonth.reverse();

    this.incomeTransactions = transactionsForCurrentMonth
      .filter((t) => t.description.includes(PAYROLL_NAME))
      .map((t) => ({ amount: t.amount, type: ACCOUNT_NAME[t.account] }));
  }

  #getIncomeForBank(bankName, transactionCountKey) {
    return this.incomeTransactions
      .filter((t) => t.type === bankName)
      .slice(global.transactionCounts[transactionCountKey]);
  }

  getIncomeTransactions() {
    const chaseIncome = this.#getIncomeForBank(BANK_NAME.CHASE, 'chaseIncome');
    const wellsFargoIncome = this.#getIncomeForBank(BANK_NAME.WELLS_FARGO, 'wellsFargoIncome');

    global.transactionCounts.chaseIncome += chaseIncome.length;
    global.transactionCounts.wellsFargoIncome += wellsFargoIncome.length;

    return [...chaseIncome, ...wellsFargoIncome];
  }
}
