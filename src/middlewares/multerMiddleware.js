import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/statusConstant.js';
import FileTypeUtil from '../utils/fileTypeUtil.js';

/**
 * Multer Middleware
 * Xử lý việc tải lên file trong các request
 */

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Thư mục lưu file theo loại
    let uploadPath = 'uploads/';

    // Tạo thư mục upload nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Nếu là hình ảnh, lưu vào thư mục images
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audios/';
    } else {
      uploadPath += 'documents/';
    }

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

// Filter kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Danh sách các loại file được chấp nhận
  const allowedMimeTypes = FileTypeUtil.allAllowedFileTypes;

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Chấp nhận file
    cb(null, true);
  } else {
    // Từ chối file với thông báo lỗi
    cb(new Error('Loại file không được hỗ trợ'), false);
  }
};

// Khởi tạo multer với cấu hình
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn kích thước file 5MB
  }
});

// Middleware xử lý lỗi upload
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi của multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(StatusConstant.BAD_REQUEST).json(
        ResponseUtils.badRequestResponse('File quá lớn. Kích thước tối đa là 5MB')
      );
    }
    return res.status(StatusConstant.BAD_REQUEST).json(
      ResponseUtils.badRequestResponse(`Lỗi tải lên file: ${err.message}`)
    );
  } else if (err) {
    // Lỗi khác
    return res.status(StatusConstant.BAD_REQUEST).json(
      ResponseUtils.badRequestResponse(err.message || 'Lỗi tải lên file')
    );
  }
  next();
};

// Helper tạo middleware cho từng trường hợp cụ thể
const multerMiddleware = {
  // Upload một file duy nhất
  single: (fieldName) => [upload.single(fieldName), handleMulterError],

  // Upload nhiều file cùng field name
  array: (fieldName, maxCount = 5) => [upload.array(fieldName, maxCount), handleMulterError],

  // Upload nhiều file với các field name khác nhau
  fields: (fields) => [upload.fields(fields), handleMulterError],

  // Upload không file nào
  none: () => [upload.none(), handleMulterError]
};

export default multerMiddleware;