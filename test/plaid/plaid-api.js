/* eslint-disable no-console */
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { format, subDays } from 'date-fns';

export const PAYER = 'BETTERLESSON';

export const CREDIT_CARD_TRANSACTION = {
  WELLS_FARGO_PROPEL: 'WF CONSUMER AUTO PAY',
  WELLS_FARGO_PLATINUM: 'WF CREDIT CARD AUTO PAY',
  AMEX: 'AMERICAN EXPRESS ACH PMT',
  DISCOVER_IT: 'DISCOVER E-PAYMENT',
  CITI: 'CITI AUTOPAY PAYMENT',
  CHASE: 'CHASE CREDIT CRD AUTOPAY PPD ID: 4760039224',
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
