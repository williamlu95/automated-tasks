import { format } from 'date-fns';
import LoginPage from '../pageobjects/nelnet-login-page';
import PaymentPage from '../pageobjects/nelnet-payment-page';

const { NELNET_LOGIN, NELNET_PASSWORD } = process.env;

describe('Set nelnet payment date', () => {
  const today = format(new Date(), 'd');

  if (today === '1') {
    context('when it is the first of the month', () => {
      before(async () => {
        await LoginPage.open();
        await LoginPage.login(NELNET_LOGIN, NELNET_PASSWORD);
        await PaymentPage.open();
        await PaymentPage.setAmount(process.env.STUDENT_LOAN_PAYMENT_AMOUNT);
        await PaymentPage.chooseBank();
        await PaymentPage.pay();
      });

      it('should set the payment date', async () => {
        await expect(PaymentPage.paySuccessMessage).toHaveTextContaining(
          'Thank you. Your payment has been scheduled',
        );
      });
    });
  } else {
    context('when it is not the first of the month', () => {
      it('should do nothing', () => expect(true).toEqual(true));
    });
  }
});
