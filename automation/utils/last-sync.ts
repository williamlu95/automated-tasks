import fs from 'fs';
import { DateTime } from 'luxon';
import { replaceSheetData } from './google-sheets';

type LastSyncDate = {
    sofi: number | null;
    teller: number |null;
    wallet: number |null;
}

const formatDate = (value: null | number): string => {
  if (!value) {
    return '';
  }

  return DateTime.fromMillis(value).toISO() || '';
};

const FILE_LOCATION = './last-sync.json';

export class LastSync {
  // eslint-disable-next-line no-use-before-define
  private static instance: LastSync = new LastSync();

  private lastSyncDate: LastSyncDate;

  constructor() {
    try {
      this.lastSyncDate = JSON.parse(fs.readFileSync(FILE_LOCATION).toString());
    } catch (err) {
      console.error('Could not read from permanent file starting from empty state', err);
      this.lastSyncDate = { sofi: null, teller: null, wallet: null };
    }
  }

  public static async updateLastSyncDate(key: 'sofi' | 'teller' | 'wallet', dateInMs: number) {
    this.instance.lastSyncDate[key] = dateInMs;
    fs.writeFileSync(FILE_LOCATION, JSON.stringify(this.instance.lastSyncDate, null, 4), 'utf8');
    await replaceSheetData('Last Sync', this.getLastSyncSheetData());
  }

  public static getLastSyncSheetData() {
    return Object.entries(this.instance.lastSyncDate).map(([key, value]) => [key, formatDate(value)]);
  }
}
