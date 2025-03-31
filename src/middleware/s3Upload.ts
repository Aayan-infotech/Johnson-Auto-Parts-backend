import { Request, Response, NextFunction } from 'express';
import { getS3Client } from '../config/awsConfig';
import { upload } from './multerUpload';

// Extend Request to include file locations
interface MulterRequest extends Request {
  fileLocations?: string[];
}

// Upload files to S3
export const uploadToS3 = async (req: MulterRequest, res: Response, next: NextFunction) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      req.fileLocations = [];
      return next();
    }

    try {
      const s3 = await getS3Client();
      const fileLocations: string[] = [];

      for (const file of req.files as Express.Multer.File[]) {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME as string,
          Key: `${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.putObject(params);
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
        fileLocations.push(fileUrl);
      }

      req.fileLocations = fileLocations;
      next();
    } catch (uploadError) {
      return res.status(500).json({ error: (uploadError as Error).message });
    }
  });
};
