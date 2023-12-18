import * as dotenv from 'dotenv';
import * as nodemailer from 'nodemailer';
import * as imaps from 'imap-simple';
import Mail from 'nodemailer/lib/mailer';

dotenv.config();

const {
  GMAIL_LOGIN,
  GMAIL_PASSWORD,
  MOTHER_GMAIL_LOGIN,
  MOTHER_GMAIL_PASSWORD,
  JOINT_GMAIL_LOGIN,
  JOINT_GMAIL_PASSWORD,
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
  mint: '',
  tmobile: '',
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

const motherConfig = {
  imap: {
    user: MOTHER_GMAIL_LOGIN || '',
    password: MOTHER_GMAIL_PASSWORD || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

const jointConfig = {
  imap: {
    user: JOINT_GMAIL_LOGIN || '',
    password: JOINT_GMAIL_PASSWORD || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 3000,
    tlsOptions: { rejectUnauthorized: false },
  },
};

const readEmails = (config: imaps.ImapSimpleOptions) => (
  setVerificationCodes = true,
) => imaps.connect(config).then((connection) => {
  connection.openBox('INBOX').then(() => {
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: ['TEXT'], struct: true };
    return connection.search(searchCriteria, fetchOptions);
  }).then((messages) => {
    const taskList = messages.map((message) => new Promise<void>((res, rej) => {
      const parts = imaps.getParts(message.attributes.struct || []);

      parts.map((part) => connection.getPartData(message, part)
        .then((partData) => {
          if (part.disposition == null && part.encoding !== 'base64' && setVerificationCodes) {
            const text = partData.replace(/<[^>]*>?/gm, '').replace(/\s/g, '');
            const mintVerificationCode = text.match(/Verificationcode:(\d+)/)?.[1];
            verificationCodes.mint = mintVerificationCode;

            const tmobileVerificationCode = text.match(/YourT-MobileIDverificationcodeis(\d+)/)?.[1];
            verificationCodes.tmobile = tmobileVerificationCode;
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

export const readPersonalEmails = readEmails(personalConfig);

export const readMothersEmails = readEmails(motherConfig);

export const readJointEmails = readEmails(jointConfig);
