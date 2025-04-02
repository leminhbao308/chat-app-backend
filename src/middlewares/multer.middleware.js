import multer from 'multer';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';
import FileTypeUtil from '../utils/fileTypeUtil.js';

const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH || 'uploads';
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE || 5 * 1024 * 1024; // 5MB

const createUploadPath = (type) => {
  const fullPath = path.join(UPLOAD_BASE_PATH, type);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const getUploadPathForMimeType = (mimetype) => {
  if (mimetype.startsWith('image/')) return createUploadPath('images');
  if (mimetype.startsWith('video/')) return createUploadPath('videos');
  if (mimetype.startsWith('audio/')) return createUploadPath('audios');
  return createUploadPath('documents');
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPathForMimeType(file.mimetype);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExt = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isAllowedType = FileTypeUtil.allAllowedFileTypes.includes(file.mimetype);
  cb(isAllowedType ? null : new Error('Unsupported file type'), isAllowedType);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

const handleMulterError = (err, req, res, next) => {
  const errorResponses = {
    'LIMIT_FILE_SIZE': 'File too large. Maximum size is 5MB',
    'default': err.message || 'File upload error'
  };

  const errorMessage = err instanceof multer.MulterError
      ? (errorResponses[err.code] || errorResponses.default)
      : errorResponses.default;

  return res.status(StatusConstant.BAD_REQUEST).json(
      ResponseUtils.badRequestResponse(errorMessage)
  );
};

const MulterMiddleware = {
  single: (fieldName) => [upload.single(fieldName), handleMulterError],
  array: (fieldName, maxCount = 5) => [upload.array(fieldName, maxCount), handleMulterError],
  fields: (fields) => [upload.fields(fields), handleMulterError],
  none: () => [upload.none(), handleMulterError]
};

export default MulterMiddleware;
