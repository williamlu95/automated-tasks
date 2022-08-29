/* eslint-disable no-console */
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { format, subDays } from 'date-fns';
import { sendTextMessage } from '../twilio/twilio';

const {
  CHASE_ACCESS_TOKEN,
  CHASE_CHECKING_ID,
  WELLS_FARGO_ACCESS_TOKEN,
  WELLS_FARGO_CHECKING_ID,
} = process.env;

export const PAYER = 'BETTERLESSON';

export const BANK_NAME = {
  CHASE: 'Chase',
  WELLS_FARGO: 'Wells Fargo',
};

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

const getTransactions = async ({ accessToken, accountIds, date }) => {
  try {
    const response = await client.transactionsGet({
      access_token: accessToken,
      start_date: format(date, 'yyyy-MM-dd'),
      end_date: format(date, 'yyyy-MM-dd'),
      options: {
        account_ids: accountIds,
      },
    });

    return response;
  } catch (err) {
    console.log('plaid api error: ', err);
    sendTextMessage('Plaid Api call failed');
    throw err;
  }
};

const getAccessToken = (bank) => {
  switch (bank) {
    case BANK_NAME.CHASE:
      return { accessToken: CHASE_ACCESS_TOKEN, accountId: CHASE_CHECKING_ID };
    case BANK_NAME.WELLS_FARGO:
      return { accessToken: WELLS_FARGO_ACCESS_TOKEN, accountId: WELLS_FARGO_CHECKING_ID };
    default:
      throw new Error('Not a valid bank name');
  }
};

export const getPayrollTransactions = async (bank) => {
  const today = new Date();
  const { accessToken, accountId } = getAccessToken(bank);
  const response = await getTransactions({ accessToken, accountIds: [accountId], date: today });
  const { transactions } = response.data;
  console.log(`${bank} payroll transactions: `, transactions.map(({ name, amount }) => ({ name, amount })));
  return transactions.filter(({ name }) => name.toUpperCase().includes(PAYER));
};

export const getCreditCardTransactions = async (bank) => {
  const yesterday = subDays(new Date(), 1);
  const { accessToken, accountId } = getAccessToken(bank);
  const response = await getTransactions({ accessToken, accountIds: [accountId], date: yesterday });
  const { transactions } = response.data;
  console.log(`${bank} credit card transactions: `, transactions.map(({ name, amount }) => ({ name, amount })));
  return transactions
    .filter(({ name }) => CREDIT_CARD_TRANSACTIONS.some((t) => name.toUpperCase().includes(t)));
};
