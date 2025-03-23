import jwt from 'jsonwebtoken';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/statusConstant.js';

/**
 * Authentication middleware
 * Kiểm tra và xác thực JWT token từ request header
 */
const authMiddleware = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusConstant.UNAUTHORIZED).json(
                ResponseUtils.unauthorizedResponse('Không tìm thấy token xác thực')
            );
        }

        // Lấy token (bỏ "Bearer " ở đầu)
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(StatusConstant.UNAUTHORIZED).json(
                ResponseUtils.unauthorizedResponse('Không tìm thấy token xác thực')
            );
        }

        // Verify JWT token and extract user data
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // Đặt thông tin user vào request để các route có thể sử dụng
            req.user = decoded;

            // Tiếp tục xử lý request
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Token đã hết hạn')
                );
            }

            return res.status(StatusConstant.UNAUTHORIZED).json(
                ResponseUtils.unauthorizedResponse('Token không hợp lệ')
            );
        }
    } catch (error) {
        return res.status(StatusConstant.UNAUTHORIZED).json(
            ResponseUtils.unauthorizedResponse('Lỗi xác thực: ' + error.message)
        );
    }
};

export default authMiddleware;