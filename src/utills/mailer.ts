// utils/mailer.util.ts
import nodemailer from 'nodemailer';
import getConfig from "../config/loadConfig";

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions) => {
  await transporter.sendMail({
    from: `AutoParts Store <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
