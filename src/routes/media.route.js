import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import MulterMiddleware from "../middlewares/multer.middleware.js";
import ApiConstant from "../constants/api.constant.js";
import controllers from "../controllers/index.js";

const MediaRouter = express.Router();

/**
 * @route   POST /media/one-attachment
 * @desc    Upload một file
 * @access  Private
 */
MediaRouter.post(
    ApiConstant.MEDIA.UPLOAD_ONE.path,
    authMiddleware,
    MulterMiddleware.single('file'),
    controllers.media.uploadFile
);

/**
 * @route   POST /media/multi-attachments
 * @desc    Upload tối đa 5 files
 * @access  Private
 */
MediaRouter.post(
    ApiConstant.MEDIA.UPLOAD_MULTIPLE.path,
    authMiddleware,
    MulterMiddleware.array('files', 5),  // Giới hạn tối đa 5 files
    controllers.media.uploadFiles
);

/**
 * @route   GET /media/download-by-url
 * @desc    Tải tệp về bằng url
 * @access  Private
 */
MediaRouter.get(
    ApiConstant.MEDIA.DOWNLOAD_BY_URL.path,
    authMiddleware,
    controllers.media.downloadFileByUrl
);

export default MediaRouter;
