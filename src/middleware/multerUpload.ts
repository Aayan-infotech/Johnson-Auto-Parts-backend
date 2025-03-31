import multer from 'multer';

// Memory storage for temporary file storage before S3 upload
const storage = multer.memoryStorage();

// Configure Multer (limit file size & number of files)
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).array('files', 5); // Limit to 5 files
