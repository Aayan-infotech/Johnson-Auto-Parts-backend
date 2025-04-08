import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { getS3Client } from '../config/awsConfig';
import getConfig from "../config/loadConfig";

const config = getConfig();

interface MulterRequest extends Request {
  fileLocations?: string[];
}

const storage = multer.memoryStorage();

// Accept a single file with field name "files"
const upload = multer({ storage }).single("files");

export const uploadToS3 = async (req: MulterRequest, res: Response, next: NextFunction) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.file) {
      req.fileLocations = [];
      return next();
    }

    try {
      const s3 = await getS3Client();
      const fileLocations: string[] = [];

      const params = {
        Bucket: (await config).BUCKET_NAME as string,
        Key: `${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3.putObject(params);
      const fileUrl = `https://${(await config).BUCKET_NAME}.s3.${(await config).AWS_REGION}.amazonaws.com/${params.Key}`;
      fileLocations.push(fileUrl);

      req.fileLocations = fileLocations;

      // ✅ You should now have req.body populated
      return next();
    } catch (uploadError) {
      return res.status(500).json({ error: (uploadError as Error).message });
    }
  });
};
