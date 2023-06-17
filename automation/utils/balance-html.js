const BASE_CELL_STYLE = {
  border: '1px solid #dddddd',
  'text-align': 'left',
  padding: '8px',
};

const buildCellHTML = (value, tag = 'th', styleOverrides = {}) => {
  const style = Object.entries({ ...BASE_CELL_STYLE, ...styleOverrides })
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

  return `<${tag} style="${style};">${value}</${tag}>`;
};

const getDifferenceStyle = (difference) => {
  if (difference === '$0.00') {
    return {};
  }

  return { color: difference.startsWith('-') ? '#ED2936' : '#3BCA6D' };
};

export const buildBalanceHTML = (accountBalance) => `
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
