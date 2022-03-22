/* eslint-disable no-console */
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { format, subDays } from 'date-fns';

export const PAYER = 'BETTERLESSON';

export const CREDIT_CARD_TRANSACTION = {
  AMAZON_PRIME_REWARDS: 'PAYMENT TO CHASE CARD ENDING IN 3723',
  CHASE_FREEDOM_UNLIMITED: 'PAYMENT TO CHASE CARD ENDING IN 7155',
  CHASE_FREEDOM_FLEX: 'PAYMENT TO CHASE CARD ENDING IN 3591',
  WELLS_FARGO_PROPEL: 'WELLS FARGO CARD CCPYMT 9076605289393',
  WELLS_FARGO_PLATINUM: 'WELLS FARGO CARD CCPYMT 90143067649840',
  AMEX_BLUE_CASH: 'AMERICAN EXPRESS ACH PMT',
  DISCOVER_IT: 'DISCOVER E-PAYMENT',
  CITI: 'CITI CARD ONLINE PAYMENT',

};

const CREDIT_CARD_TRANSACTIONS = Object.values(CREDIT_CARD_TRANSACTION);

const configuration = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);

export const getPayrollTransactions = async (accessToken, accountIds) => {
  const today = new Date();
  const response = await client.transactionsGet({
    access_token: accessToken,
    start_date: format(today, 'yyyy-MM-dd'),
    end_date: format(today, 'yyyy-MM-dd'),
    options: {
      account_ids: accountIds,
    },
  });

  const { transactions } = response.data;
  console.log('payroll transactions :>> ', transactions.map(({ name, amount }) => ({ name, amount })));
  return transactions.filter(({ name }) => name.toUpperCase().includes(PAYER));
};

export const getCreditCardTransactions = async (accessToken, accountIds) => {
  const yesterday = subDays(new Date(), 1);
  const response = await client.transactionsGet({
    access_token: accessToken,
    start_date: format(yesterday, 'yyyy-MM-dd'),
    end_date: format(yesterday, 'yyyy-MM-dd'),
    options: {
      account_ids: accountIds,
    },
  });

  const { transactions } = response.data;
  console.log('credit card transactions :>> ', transactions.map(({ name, amount }) => ({ name, amount })));
  return transactions
    .filter(({ name }) => CREDIT_CARD_TRANSACTIONS.some((t) => name.toUpperCase().includes(t)));
};
