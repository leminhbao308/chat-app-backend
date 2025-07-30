import s3Helper from "../helper/s3.helper.js";

/**
 * Middleware để đảm bảo kết nối đến AWS S3 trước khi xử lý request
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Function} next Next middleware function
 */
const S3Middleware = async (req, res, next) => {
    try {
        // Kiểm tra và khởi tạo kết nối S3 nếu chưa kết nối
        if (!s3Helper.isConnected()) {
            await s3Helper.connect();
        }
        next();
    } catch (error) {
        console.error('S3 connection error in middleware:', error);

        // Nếu lỗi S3 không ảnh hưởng nghiêm trọng đến ứng dụng, có thể tiếp tục
        // Nếu S3 là bắt buộc, trả về lỗi 503 Service Unavailable
        if (process.env.S3_REQUIRED === 'true') {
            return res.status(503).json({
                success: false,
                message: 'Storage service is temporarily unavailable',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Trường hợp S3 không bắt buộc, tiếp tục request
        next();
    }
};

export default S3Middleware;
