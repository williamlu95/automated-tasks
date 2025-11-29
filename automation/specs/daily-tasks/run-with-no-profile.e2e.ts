import SofiExportTransactionPage from '../../pageobjects/sofi-export-transaction-page';
import { timeFn } from '../../utils/fn-timer';
import { TellerData } from '../../utils/teller-data';

const downloadSofiTransactions = async () => {
  await SofiExportTransactionPage.downloadTransactions();
};

const downloadTellerData = async () => {
  await new TellerData().initializeFromApi();
};

describe('Run daily tasks without chrome profile', () => {
  before(async () => {
    await timeFn(downloadSofiTransactions, 'Download Sofi Transactions');
    await timeFn(downloadTellerData, 'Download Teller Data');
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
