import nodemailer from 'nodemailer';
import Imap from 'imap';

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

export const imap = new Imap({
  user: GMAIL_LOGIN,
  password: GMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

export const readEmails = () => {
  function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
  }

  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) throw err;
      const f = imap.seq.fetch('1:3', {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        struct: true,
      });

      f.on('message', (msg, seqno) => {
        console.log('Message #%d', seqno);
        const prefix = `(#${seqno}) `;
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });
      });

      f.once('error', (err) => {
        console.log(`Fetch error: ${err}`);
      });

      f.once('end', () => {
        console.log('Done fetching all messages!');
        imap.end();
      });
    });
  });

  imap.once('error', (err) => {
    console.log(err);
  });

  imap.once('end', () => {
    console.log('Connection ended');
  });

  imap.connect();
};
