// utils/mailer.util.ts
import nodemailer from "nodemailer";
import getConfig from "../config/loadConfig";
const config = getConfig();

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ to, subject, html }: MailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: (await config).EMAIL_USER||process.env.EMAIL_USER,
        pass: (await config).EMAIL_PASS||process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.sendMail({
      from: `AutoParts Store <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
