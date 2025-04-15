import jwt from 'jsonwebtoken';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';

/**
 * Authentication middleware
 * Validates JWT token from request header
 */
const AuthMiddleware = (req, res, next) => {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Validate header format
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(StatusConstant.UNAUTHORIZED).json(
            ResponseUtils.unauthorizedResponse('No authentication token found')
        );
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(StatusConstant.UNAUTHORIZED).json(
            ResponseUtils.unauthorizedResponse('No authentication token found')
        );
    }

    // Get secret key with fallback
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (jwtError) {
        // Handle specific JWT errors
        const errorResponses = {
            'TokenExpiredError': 'Token đã hết hạn',
            'JsonWebTokenError': 'Token không hợp lệ'
        };

        const errorMessage = errorResponses[jwtError.name] || 'Lỗi xác thực';

        return res.status(StatusConstant.UNAUTHORIZED).json(
            ResponseUtils.unauthorizedResponse(errorMessage)
        );
    }
};

export default AuthMiddleware;
