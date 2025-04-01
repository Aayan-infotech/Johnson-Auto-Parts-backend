import dotenv from "dotenv";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

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
  SESSION_SECRET:string
  BUCKET_NAME:string;
  AWS_REGION:string
}

async function getConfig(): Promise<Config> {
  if (ENV === "production") {
    try {
      console.log(111);
      const command = new GetSecretValueCommand({
        SecretId: "john4",
      });
      
      const response = await secretsManager.send(command);
      
      if (response.SecretString) {
        try {
          const secrets = JSON.parse(response.SecretString);
          return {
            MONGO_URI: secrets.MONGO_URI,
            PORT: parseInt(secrets.PORT),
            JWT_ACCESS_SECRET: secrets.JWT_ACCESS_SECRET,
            JWT_REFRESH_SECRET: secrets.JWT_REFRESH_SECRET,
            EMAIL_USER: secrets.EMAIL_USER,
            EMAIL_PASS: secrets.EMAIL_PASS,
            SESSION_SECRET:'john-session',
            BUCKET_NAME:"johnson-kbo60b7v",
            AWS_REGION:"us-east-1"
          };
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error("Failed to parse secret value as JSON");
        }
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
    SESSION_SECRET:'john-session',
    BUCKET_NAME:process.env.BUCKET_NAME||"",
    AWS_REGION:process.env.AWS_REGION||""
  };
}

export default getConfig;
