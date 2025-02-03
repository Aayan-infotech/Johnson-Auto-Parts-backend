import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";


const generateOTP = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        await transporter.sendMail({
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const generateResetToken = (userId: string): string => {{
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET as string, { expiresIn: "15m" });
}}

export { generateOTP, sendEmail , generateResetToken}