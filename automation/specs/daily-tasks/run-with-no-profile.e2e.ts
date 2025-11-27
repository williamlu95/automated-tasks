import SofiExportTransactionPage from '../../pageobjects/sofi-export-transaction-page';
import { timeFn } from '../../utils/fn-timer';

const downloadSofiTransactions = async () => {
  await SofiExportTransactionPage.downloadTransactions();
};

describe('Run daily tasks without chrome profile', () => {
  before(async () => {
    await timeFn(downloadSofiTransactions, 'Download Sofi Transactions');
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
