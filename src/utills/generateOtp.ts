import getConfig from "../config/loadConfig";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";


const generateOTP = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const config=await getConfig();
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user:config.EMAIL_USER ,
                pass: config.EMAIL_PASS,
            },
        });
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

const generateResetToken = async(userId: string): Promise<string> => {{
    const config=await getConfig();
    return jwt.sign({ userId }, config.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}}

export { generateOTP, sendEmail , generateResetToken}