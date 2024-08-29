import { readPersonalEmails } from '../../utils/notification';
import TmobileDashboardPage from '../../pageobjects/tmobile-dashboard-page';
import TmobileLoginPage from '../../pageobjects/tmobile-login-page';

describe('Pay T-Mobile Bill', () => {
  before(async () => {
    readPersonalEmails(false);

    await TmobileLoginPage.open();
    await TmobileLoginPage.acceptCookies();
    await TmobileLoginPage.login();
    await TmobileDashboardPage.payBill();
  });

  it('tasks have successfully ran', () => expect(true).toEqual(true));
});
