import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import * as imaps from 'imap-simple';
import Mail from 'nodemailer/lib/mailer';

dotenv.config();

const {
  GMAIL_LOGIN,
  GMAIL_PASSWORD,
  MAIL_TO,
} = process.env;

const emailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_LOGIN,
    pass: GMAIL_PASSWORD,
  },
});

export const verificationCodes = {
  sofi: '',
  wallet: '',
};

export const errorNotification = async (errorMessage: string) => {
  await emailer.sendMail({
    from: GMAIL_LOGIN,
    to: MAIL_TO,
    subject: 'Home Server - ERROR',
    text: errorMessage,
  });

  throw Error(errorMessage);
};

export const sendEmail = async (options: Mail.Options) => emailer.sendMail({
  ...options,
  from: GMAIL_LOGIN,
  to: MAIL_TO,
});

const personalConfig = {
  imap: {
    user: GMAIL_LOGIN || '',
    password: GMAIL_PASSWORD || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

const readEmails = (config: imaps.ImapSimpleOptions) => (setVerificationCodes = true) => imaps.connect(config).then((connection) => {
  connection
    .openBox('INBOX')
    .then(() => {
      const searchCriteria = ['ALL'];
      const fetchOptions = { bodies: ['TEXT'], struct: true };
      return connection.search(searchCriteria, fetchOptions);
    })
    .then((messages) => {
      const taskList = messages.map(
        (message) => new Promise<void>((res, rej) => {
          const parts = imaps.getParts(message.attributes.struct || []);

          parts.map((part) => connection.getPartData(message, part).then((partData) => {
            if (part.disposition == null && setVerificationCodes) {
              const text = part.encoding === 'BASE64' ? (Buffer.from(partData, 'base64').toString('ascii')) : partData.replace(/<[^>]*>?/gm, '').replace(/\s/g, '');
              const sofiVerificationCode = text.match(/LoginCode:(\d+)/)?.[1];
              verificationCodes.sofi = sofiVerificationCode;

              const wallet = partData?.match(/href="https:\/\/web\.budgetbakers\.com\/sso\?ssoToken=(.+)"/)?.[1];
              verificationCodes.wallet = wallet;
            }

            connection.addFlags(message.attributes.uid, 'Deleted', (err) => {
              if (err) {
                console.log('Problem marking message for deletion');
                rej(err);
              }

              res();
            });
          }));
        }),
      );

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

export const readPersonalEmails = readEmails(personalConfig);
