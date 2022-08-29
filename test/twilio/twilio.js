import Twilio from 'twilio';

const {
  TWILIO_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  PERSONAL_PHONE_NUMBER,
} = process.env;

const client = new Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

export const sendTextMessage = (messageText) => {
  client.messages
    .create({
      body: messageText,
      from: TWILIO_PHONE_NUMBER,
      to: PERSONAL_PHONE_NUMBER,
    })
  // eslint-disable-next-line no-console
    .then((message) => console.log(message.sid));
};
