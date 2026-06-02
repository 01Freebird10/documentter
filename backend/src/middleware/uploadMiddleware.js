import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AppError from '../utils/appError.js';

// Ensure upload directory exists
const uploadDir = './src/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name schema: fieldname-timestamp-random.zip
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// ZIP filter validator
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (fileExt === '.zip' || file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
    cb(null, true);
  } else {
    cb(new AppError('Format rejected. Only zipped repository archives (.zip) are allowed.', 400), false);
  }
};

// Size constraint: 100MB limit
const limits = {
  fileSize: 100 * 1024 * 1024 // 100MB in bytes
};

const uploadZip = multer({
  storage,
  fileFilter,
  limits
});

export default uploadZip;
