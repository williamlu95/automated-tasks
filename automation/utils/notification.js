import nodemailer from 'nodemailer';

const {
  GMAIL_LOGIN,
  GMAIL_PASSWORD,
  MAIL_TO,
} = process.env;

export const initializeEmailSender = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_LOGIN,
    pass: GMAIL_PASSWORD,
  },
});

export const errorNotification = async (errorMessage) => {
  await global.emailSender.sendMail({
    from: GMAIL_LOGIN,
    to: MAIL_TO,
    subject: 'Home Server - ERROR',
    text: errorMessage,
  });

  throw Error(errorMessage);
};

export const sendEmail = async ({ subject, text }) => global.emailSender.sendMail({
  from: GMAIL_LOGIN,
  to: MAIL_TO,
  subject,
  text,
});
