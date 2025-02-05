import dotenv from "dotenv";
import * as AWS from "aws-sdk";

dotenv.config();
const ENV = process.env.NODE_ENV || "development";
const secretsManager = new AWS.SecretsManager({ region: "us-east=1" });

interface Config {
  MONGO_URI: string;
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
}

async function getConfig(): Promise<Config> {
  if (ENV !== "development") {
    try {
      const data = await secretsManager.getSecretValue({ SecretId: "john-secret" }).promise();
      if (data.SecretString) {
        const secrets = JSON.parse(data.SecretString);
        return {
          MONGO_URI: secrets.MONGO_URI,
          PORT: parseInt(secrets.PORT),
          JWT_ACCESS_SECRET: secrets.JWT_ACCESS_SECRET,
          JWT_REFRESH_SECRET: secrets.JWT_REFRESH_SECRET,
          EMAIL_USER: secrets.EMAIL_USER,
          EMAIL_PASS: secrets.EMAIL_PASS,
        };
      }
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
  };
}

export default getConfig;