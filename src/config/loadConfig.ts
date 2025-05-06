import dotenv from "dotenv";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

dotenv.config();
const ENV = process.env.NODE_ENV || "production";
const secretsManager = new SecretsManagerClient({ region: "us-east-1" });

interface Config {
  MONGO_URI: string;
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  SESSION_SECRET: string;
  BUCKET_NAME: string;
  AWS_REGION: string;
  SLIMCD_USERNAME: string;
  SLIMCD_PASSWORD: string;
  SLIMCD_CLIENTID: number;
  SLIMCD_SITEID: number;
  SLIMCD_PRICEID: number;
  SLIMCD_API_URL: string;
}

async function getConfig(): Promise<Config> {
  if (ENV === "production") {
    try {
      const command = new GetSecretValueCommand({
        SecretId: "john4",
      });
        // console.log("command",command)
      const response = await secretsManager.send(command);
      console.log("response",response)

      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        return {
          MONGO_URI: secrets.MONGO_URI,
          PORT: parseInt(secrets.PORT),
          JWT_ACCESS_SECRET: secrets.JWT_ACCESS_SECRET,
          JWT_REFRESH_SECRET: secrets.JWT_REFRESH_SECRET,
          EMAIL_USER: secrets.EMAIL_USER,
          EMAIL_PASS: secrets.EMAIL_PASS,
          SESSION_SECRET: "john-session",
          BUCKET_NAME: "robert-64qi1m2t",
          AWS_REGION: "us-east-1",
          SLIMCD_USERNAME: "R6UT8C6M",
          SLIMCD_PASSWORD: "iamgroot",
          SLIMCD_CLIENTID: 1032,
          SLIMCD_SITEID: 228226448,
          SLIMCD_PRICEID: 74,
          SLIMCD_API_URL: "https://trans.slimcd.com/soft/json/jsonpayment.asp",
        };
      }
      throw new Error("No secret string found in the response");
    } catch (error) {
      console.error("AWS Secrets Fetch Error:", error);
      throw new Error("Failed to load secrets from AWS Secrets Manager");
    }
  }

  return {
    MONGO_URI: process.env.MONGO_URI || "",
    PORT: parseInt(process.env.PORT || "5050"),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    SESSION_SECRET: "john-session",
    BUCKET_NAME: process.env.BUCKET_NAME || "",
    AWS_REGION: process.env.AWS_REGION || "",
    SLIMCD_USERNAME: process.env.SLIMCD_USERNAME || "R6UT8C6M",
    SLIMCD_PASSWORD: process.env.SLIMCD_PASSWORD || "iamgroot",
    SLIMCD_CLIENTID: parseInt(process.env.SLIMCD_CLIENTID || "1032"),
    SLIMCD_SITEID: parseInt(process.env.SLIMCD_SITEID || "228226448"),
    SLIMCD_PRICEID: parseInt(process.env.SLIMCD_PRICEID || "74"),
    SLIMCD_API_URL:
      process.env.SLIMCD_API_URL ||
      "https://trans.slimcd.com/soft/json/jsonpayment.asp",
  };
}

export default getConfig;
