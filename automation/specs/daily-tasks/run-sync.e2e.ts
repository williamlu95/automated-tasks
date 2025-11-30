import SofiExportTransactionPage from '../../pageobjects/sofi-export-transaction-page';
import { timeFn } from '../../utils/fn-timer';
import { LastSync } from '../../utils/last-sync';
import { TellerData } from '../../utils/teller-data';

const { SKIP_SOFI_SYNC } = process.env;

const downloadSofiTransactions = async () => {
  if (SKIP_SOFI_SYNC === 'true') {
    console.log('Skipping Sofi sync');
    return;
  }

  await SofiExportTransactionPage.downloadTransactions();
  await LastSync.updateLastSyncDate('sofi', Date.now());
};

const downloadTellerData = async () => {
  await new TellerData().initializeFromApi();
  await LastSync.updateLastSyncDate('teller', Date.now());
};

describe('Run daily tasks without chrome profile', () => {
  before(async () => {
    await timeFn(downloadSofiTransactions, 'Download Sofi Transactions');
    await timeFn(downloadTellerData, 'Download Teller Data');
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
