import nodemailer from 'nodemailer';
import imaps from 'imap-simple';

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

export const sendEmail = async ({ subject, text, html }) => global.emailSender.sendMail({
  from: GMAIL_LOGIN,
  to: MAIL_TO,
  subject,
  text,
  html,
});

const config = {
  imap: {
    user: GMAIL_LOGIN,
    password: GMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

export const readEmails = (
  setVerificationCodes = true,
) => imaps.connect(config).then((connection) => {
  connection.openBox('INBOX').then(() => {
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: ['TEXT'], struct: true };
    return connection.search(searchCriteria, fetchOptions);
  }).then((messages) => {
    const taskList = messages.map((message) => new Promise((res, rej) => {
      const parts = imaps.getParts(message.attributes.struct);

      parts.map((part) => connection.getPartData(message, part)
        .then((partData) => {
          if (part.disposition == null && part.encoding !== 'base64' && setVerificationCodes) {
            const text = partData.replace(/<[^>]*>?/gm, '').replace(/\s/g, '');
            const mintVerificationCode = text.match(/Verificationcode:(\d+)/)?.[1];
            global.mintVerificationCode = mintVerificationCode;

            const tmobileVerificationCode = text.match(/YourT-MobileIDverificationcodeis(\d+)/)?.[1];
            global.tmobileVerificationCode = tmobileVerificationCode;
          }

          connection.addFlags(message.attributes.uid, 'Deleted', (err) => {
            if (err) {
              console.log('Problem marking message for deletion');
              rej(err);
            }

            res();
          });
        }));
    }));

    return Promise.all(taskList).then(() => {
      connection.imap.closeBox(true, (err) => {
        if (err) {
          console.log(err);
        }
      });
      connection.end();
    });
  });
});
