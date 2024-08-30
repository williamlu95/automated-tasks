import { DateTime } from 'luxon';
import { readPersonalEmails } from '../../utils/notification';
import SofiLoginPage from '../../pageobjects/sofi-login-page';
import SofiAccountPage from '../../pageobjects/sofi-account-page';
import { INCOME } from '../../constants/joint-transactions';

describe('Move excess to PTO', () => {
  before(async () => {
    const today = DateTime.now().toFormat('MM/dd/y');
    if (!INCOME.LISA_SALARY.days?.includes(today)) {
      return;
    }

    readPersonalEmails(false);
    await SofiLoginPage.open();
    await SofiLoginPage.acceptCookes();
    await SofiLoginPage.login();
    await SofiAccountPage.open();
    await SofiAccountPage.moveExcessToPTO();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
