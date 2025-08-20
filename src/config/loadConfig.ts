import dotenv from "dotenv";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

dotenv.config();
const ENV = process.env.NODE_ENV || "production";
const secretsManager = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  // },
});

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
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  SLIMCD_USERNAME: string;
  SLIMCD_PASSWORD: string;
  SLIMCD_CLIENTID: number;
  SLIMCD_SITEID: number;
  SLIMCD_PRICEID: number;
  SLIMCD_API_URL: string;
}

// Default configuration that doesn't change between environments
const defaultConfig = {
  SESSION_SECRET: "john-session",
  BUCKET_NAME: "auto-parts-bucket-sdfgh",
  AWS_REGION: "us-east-1",
  SLIMCD_USERNAME: "R6UT8C6M",
  SLIMCD_PASSWORD: "iamgroot",
  SLIMCD_CLIENTID: 1032,
  SLIMCD_SITEID: 228226448,
  SLIMCD_PRICEID: 74,
  SLIMCD_API_URL: "https://trans.slimcd.com/soft/json/jsonpayment.asp",
};

async function getConfig(): Promise<Config> {
  if (ENV === "production") {
    try {
      const command = new GetSecretValueCommand({
        SecretId: "auto-parts",
      });
      const response = await secretsManager.send(command);

      if (response.SecretString) {
        const secrets = JSON.parse(response.SecretString);
        return {
          ...defaultConfig,
          MONGO_URI: secrets.MONGO_URI,
          PORT: parseInt(secrets.PORT),
          JWT_ACCESS_SECRET: secrets.JWT_ACCESS_SECRET,
          JWT_REFRESH_SECRET: secrets.JWT_REFRESH_SECRET,
          EMAIL_USER: secrets.EMAIL_USER,
          EMAIL_PASS: secrets.EMAIL_PASS,
          AWS_ACCESS_KEY_ID: secrets.AWS_ACCESS_KEY_ID,
          AWS_SECRET_ACCESS_KEY: secrets.AWS_SECRET_ACCESS_KEY,
        };
      }
      throw new Error("No secret string found in the response");
    } catch (error) {
      console.error("AWS Secrets Fetch Error:", error);
      throw error;
    }
  }

  // Development environment configuration
  return {
    ...defaultConfig,
    MONGO_URI: process.env.MONGO_URI || "",
    PORT: parseInt(process.env.PORT || "5050"),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  };
}

export default getConfig;
