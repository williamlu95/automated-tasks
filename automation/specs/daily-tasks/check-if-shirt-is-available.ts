import { sendEmail } from '../../utils/notification';

export const checkIfShirtIsAvailable = async () => {
  const response = await fetch('https://www.shopdisney.com/on/demandware.store/Sites-shopDisney-Site/default/Product-Variation?dwvar_5201057811363M_size=M&layout=productDetail&pid=5201057811363M&quantity=1');
  const body = await response.json();

  if (body?.product?.available) {
    await sendEmail({
      subject: 'Disney Sweater is available',
      text: 'https://www.shopdisney.com/mickey-mouse-peace-sign-pullover-sweatshirt-for-adults-5201057811363M.html',
    });
  }
};
