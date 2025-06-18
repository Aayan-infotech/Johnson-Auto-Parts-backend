import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { getS3Client } from "../config/awsConfig";
import getConfig from "../config/loadConfig";
// import { File } from "multer";

const config = getConfig();

interface MulterRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  fileLocations?: string[];
}

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("files", 10); // Accept up to 10 files

export const uploadToS3 = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.files || req.files.length === 0) {
      req.fileLocations = [];
      return next();
    }

    try {
      const s3 = await getS3Client();
      const files = req.files as Express.Multer.File[];
      const bucketName = (await config).BUCKET_NAME;
      const region = (await config).AWS_REGION;

      const fileLocations: string[] = [];

      for (const file of files) {
        const Key = `${Date.now()}-${file.originalname}`;
        const params = {
          Bucket: bucketName,
          Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.putObject(params); // use .promise() if using AWS SDK v2
        const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${Key}`;
        fileLocations.push(fileUrl);
      }

      req.fileLocations = fileLocations;
      return next();
    } catch (uploadError) {
      console.log(uploadError)
      return res.status(500).json({ error: (uploadError as Error).message });
    }
  });
};
