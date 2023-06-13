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
    this.transactions = [];
  }

  async initializeTransactions() {
    await MintLoginPage.open();
    await MintLoginPage.login();
    const transactionsPath = await MintTransactionPage.downloadTransactions();
    const transactions = await csv({ headers: TRANSACTION_HEADERS }).fromFile(transactionsPath);

    this.transactions = transactions.filter((t) => {
      const transactionMonth = getMonth(new Date(t.date)) + 1;
      const currentMonth = getMonth(new Date()) + 0;
      return transactionMonth === currentMonth;
    });
  }

  getIncomeTransactions() {
    return this.transactions
      .filter((t) => t.description.includes(PAYROLL_NAME))
      .map((t) => ({ amount: t.amount, type: ACCOUNT_NAME[t.account], date: t.date }));
  }
}

const getPayrollTransactions = async (bank) => (
  bank === BANK_NAME.WELLS_FARGO
    ? [{ type: BANK_NAME.WELLS_FARGO, amount: 2.00 }]
    : [{ type: BANK_NAME.CHASE, amount: 3.00 }]);

export const getIncomeTransactions = async () => {
  const transactions = [];

  const [wellsFargoTransactions, chaseTransactions] = await Promise.all([
    getPayrollTransactions(BANK_NAME.WELLS_FARGO),
    getPayrollTransactions(BANK_NAME.CHASE),
  ]);

  wellsFargoTransactions.forEach(({ amount }) => {
    transactions.push({
      amount, type: BANK_NAME.WELLS_FARGO,
    });
  });

  chaseTransactions.forEach(({ amount }) => {
    transactions.push({
      amount, type: BANK_NAME.CHASE,
    });
  });

  return transactions;
};
