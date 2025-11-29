import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { TellerAccount, TellerAccountBalance, TellerTransaction } from '../types/teller';

const {
  TELLER_CERT = '',
  TELLER_CERT_KEY = '',
  CHASE_TOKEN = '',
  CAPITAL_ONE_TOKEN = '',
  AMEX_TOKEN = '',
  PERSONAL_WF_TOKEN = '',
  PERSONAL_CITI_TOKEN = '',
  MOTHER_WF_TOKEN = '',
  MOTHER_CITI_TOKEN = '',
  CHASE_CHECKING = '',
  AMEX_GOLD = '',
  CAPITAL_ONE_VENTURE_X = '',
  CITI_CUSTOM_CASH = '',
  CHASE_FREEDOM_FLEX = '',
  CHASE_AMAZON = '',
  CHASE_FREEDOM_UNLIMITED = '',
  CHASE_SAPPHIRE_PREFERRED = '',
  WELLS_FARGO_PLATINUM = '',
  WELLS_FARGO_CHECKING = '',
  WELLS_FARGO_ACTIVE_CASH = '',
  AMEX_BLUE = '',
  WELLS_FARGO_AUTOGRAPH = '',
  CITI_DOUBLE_CASH = '',
  CITI_PREMIER = '',
  MOTHERS_WF = '',
  MOTHERS_CITI = '',
  JOINT_BILL = '',
} = process.env;

const getAgent = () => new https.Agent({
  cert: fs.readFileSync(TELLER_CERT),
  key: fs.readFileSync(TELLER_CERT_KEY),
});

export const getAccounts = async (token: string): Promise<TellerAccount[]> => {
  try {
    const response = await axios.get('https://api.teller.io/accounts', { httpsAgent: getAgent(), auth: { username: token, password: '' } });
    return response.data;
  } catch (err) {
    console.error(`Could not get teller accounts for token ${token}`, err);
    throw Error(`Could not get teller accounts for token ${token}`);
  }
};

export const getAccountBalance = async (token: string, accountId: string): Promise<TellerAccountBalance> => {
  try {
    const response = await axios.get(`https://api.teller.io/accounts/${accountId}/balances`, { httpsAgent: getAgent(), auth: { username: token, password: '' } });
    return response.data;
  } catch (err) {
    console.error(`Could not get account balance for account id ${accountId}`, err);
    throw Error(`Could not get account balance for account id ${accountId}`);
  }
};

export const getTransactions = async (token: string, accountId: string, startDate: string): Promise<TellerTransaction[]> => {
  try {
    const response = await axios.get(`https://api.teller.io/accounts/${accountId}/transactions`, { httpsAgent: getAgent(), auth: { username: token, password: '' }, params: { start_date: startDate } });
    return response.data;
  } catch (err) {
    console.error(`Could not get transactions for account id ${accountId}`, err);
    throw Error(`Could not get transactions for account id ${accountId}`);
  }
};

export const TOKEN_TO_ACCOUNTS: Record<string, string[]> = Object.fromEntries(Object.entries({
  [CHASE_TOKEN]: [CHASE_CHECKING, CHASE_FREEDOM_FLEX, CHASE_AMAZON, CHASE_FREEDOM_UNLIMITED, CHASE_SAPPHIRE_PREFERRED, JOINT_BILL],
  [CAPITAL_ONE_TOKEN]: [CAPITAL_ONE_VENTURE_X],
  [AMEX_TOKEN]: [AMEX_GOLD, AMEX_BLUE],
  [PERSONAL_WF_TOKEN]: [WELLS_FARGO_CHECKING, WELLS_FARGO_PLATINUM, WELLS_FARGO_ACTIVE_CASH, WELLS_FARGO_AUTOGRAPH],
  [PERSONAL_CITI_TOKEN]: [CITI_CUSTOM_CASH, CITI_DOUBLE_CASH, CITI_PREMIER],
  [MOTHER_WF_TOKEN]: [MOTHERS_WF],
  [MOTHER_CITI_TOKEN]: [MOTHERS_CITI],
}).filter(([key]) => key));

export const CHECKING_ACCOUNTS = Object.freeze([CHASE_CHECKING, WELLS_FARGO_CHECKING, MOTHERS_WF]);
