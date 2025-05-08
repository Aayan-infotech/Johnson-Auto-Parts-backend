import { S3 } from '@aws-sdk/client-s3';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import dotenv from 'dotenv';
import getConfig from "../config/loadConfig";
const config = getConfig();


dotenv.config();

const secretsManagerClient = new SecretsManagerClient({
  region: "us-east-1",
});

// Fetch AWS credentials from Secrets Manager
export const getAwsCredentials = async (): Promise<{ accessKeyId: string; secretAccessKey: string }> => {
  try {

    const command = new GetSecretValueCommand({ SecretId: 'john4' });

    const data = await secretsManagerClient.send(command);

    if (data.SecretString) { 
      const secret = JSON.parse(data.SecretString);
      return {
        accessKeyId: secret.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: secret.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY!,
      };
    }

    throw new Error('Failed to retrieve AWS credentials');
  } catch (error) {
    console.log(error)
    throw new Error('Error fetching AWS credentials from Secrets Manager');
  }
};

export const getS3Client = async (): Promise<S3> => {
  const credentials = await getAwsCredentials();
  return new S3({
    credentials,
    region: "us-east-1",
  });
};
