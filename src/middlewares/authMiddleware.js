import ResponseUtils from '../utils/response.js';

/**
 * Authentication middleware
 * Kiểm tra và xác thực JWT token từ request header
 */

const authMiddleware = (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json(
                ResponseUtils.unauthorizedResponse('Không tìm thấy token xác thực')
            );
        }

        // Lấy token (bỏ "Bearer " ở đầu)
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json(
                ResponseUtils.unauthorizedResponse('Không tìm thấy token xác thực')
            );
        }

        // TODO: Verify JWT token and extract user data
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Mock decoded data
        const decoded = {
            userId: "mock-user-id",
            email: "user@example.com"
        };

        // Đặt thông tin user vào request để các route có thể sử dụng
        req.user = decoded;

        // Tiếp tục xử lý request
        next();
    } catch (error) {
        return res.status(401).json(
            ResponseUtils.unauthorizedResponse('Token không hợp lệ')
        );
    }
};

export default authMiddleware;
