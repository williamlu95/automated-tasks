import { BalanceSheet } from '../constants/mothers-transactions';
import { Balance } from '../types/transaction';

const BASE_CELL_STYLE = {
  border: '1px solid #dddddd',
  'text-align': 'left',
  padding: '8px',
};

const buildCellHTML = (value: string, tag = 'th', styleOverrides = {}): string => {
  const style = Object.entries({ ...BASE_CELL_STYLE, ...styleOverrides })
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  return `<${tag} style="${style};">${value}</${tag}>`;
};

const getDifferenceStyle = (difference: string): { color?: string } => {
  if (difference === '$0.00') {
    return {};
  }

  return { color: difference.startsWith('-') ? '#ED2936' : '#3BCA6D' };
};

export const buildBalanceHTML = (accountBalance: Balance[]): string => `
    <table style="font-family: arial, sans-serif; border-collapse: collapse; width: 100%;">
      <tr>
          ${buildCellHTML('Account Name')}
          ${buildCellHTML('Expected Balance')}
          ${buildCellHTML('Actual Balance')}
          ${buildCellHTML('Difference')}
      </tr>
      ${accountBalance.map((a) => `
      <tr>
          ${buildCellHTML(a.accountName, 'td')}
          ${buildCellHTML(a.expectedBalance, 'td')}
          ${buildCellHTML(a.actualBalance, 'td')}
          ${buildCellHTML(a.difference.replace('-', ''), 'td', getDifferenceStyle(a.difference))}
      <tr>`).join('')}
    </table>
  `;

export const buildBalanceSheetHTML = (accountBalance: BalanceSheet[]): string => `
  <table style="font-family: arial, sans-serif; border-collapse: collapse; width: 100%;">
    <tr>
        ${buildCellHTML('Name')}
        ${buildCellHTML('Date')}
        ${buildCellHTML('Amount')}
        ${buildCellHTML('Balance')}
    </tr>
    ${accountBalance.map((a) => `
    <tr>
        ${buildCellHTML(a.name, 'td')}
        ${buildCellHTML(a.date, 'td')}
        ${buildCellHTML(a.amount.replace('-', ''), 'td', getDifferenceStyle(a.amount))}
        ${buildCellHTML(a.overall.replace('-', ''), 'td', getDifferenceStyle(a.overall))}
    <tr>`).join('')}
  </table>
`;
