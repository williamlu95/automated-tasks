import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const jwt = new JWT({
  email: process.env.GOOGLE_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const replaceSheetData = async (sheetName: string, rowData: string[][]) => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID ?? '', jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[sheetName];
  await sheet.clearRows();
  await sheet.addRows(rowData);
};
