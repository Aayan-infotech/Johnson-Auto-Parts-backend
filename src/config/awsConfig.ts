import { S3 } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import dotenv from 'dotenv';
import getConfig from "../config/loadConfig";
const config = getConfig();

dotenv.config();

const ENV = process.env.NODE_ENV || "production";

// Initialize with default region
const secretsManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  // credentials: {
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  // },
});

// Fetch AWS credentials from Secrets Manager
export const getAwsCredentials = async (): Promise<{ accessKeyId: string; secretAccessKey: string }> => {
  // if (ENV !== "production") {
  //   return {
  //     accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  //   };
  // }

  try {
    const command = new GetSecretValueCommand({ SecretId: 'auto-parts' });
    const data = await secretsManagerClient.send(command);

    if (data.SecretString) { 
      const secret = JSON.parse(data.SecretString);
      return {
        accessKeyId: secret.AWS_ACCESS_KEY_ID,
        secretAccessKey: secret.AWS_SECRET_ACCESS_KEY,
      };
    }

    throw new Error('Failed to retrieve AWS credentials');
  } catch (error) {
    console.error('Error fetching AWS credentials from Secrets Manager:', error);
    throw error;
  }
};

export const getS3Client = async (): Promise<S3> => {
  const credentials = await getAwsCredentials();
  return new S3({
    credentials,
    region: "us-east-1",
  });
};
