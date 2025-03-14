import ResponseUtils from '../utils/response.js';
import StatusConstant from "../constants/statusConstant.js";

/**
 * Error Handler Middleware
 * Xử lý các lỗi và định dạng chúng theo chuẩn response
 */
const errorHandler = (err, req, res, next) => {
    // Log lỗi ra console (trong môi trường development)
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    // Xác định loại lỗi và tạo response tương ứng
    if (err.name === 'ValidationError') {
        // Lỗi validation từ thư viện như Joi, express-validator, etc.
        return res.status(StatusConstant.BAD_REQUEST).json(ResponseUtils.badRequestResponse('Dữ liệu không hợp lệ', err.details));
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        // Lỗi JWT token
        return res.status(StatusConstant.UNAUTHORIZED).json(ResponseUtils.unauthorizedResponse('Token không hợp lệ hoặc đã hết hạn'));
    }

    // Xử lý theo status code
    const statusCode = err.statusCode || StatusConstant.INTERNAL_SERVER_ERROR;

    switch (statusCode) {
        case StatusConstant.BAD_REQUEST:
            return res.status(StatusConstant.BAD_REQUEST)
                .json(ResponseUtils.badRequestResponse(err.message));
        case StatusConstant.UNAUTHORIZED:
            return res.status(StatusConstant.UNAUTHORIZED)
                .json(ResponseUtils.unauthorizedResponse(err.message));
        case StatusConstant.NOT_FOUND:
            return res.status(StatusConstant.NOT_FOUND)
                .json(ResponseUtils.notFoundResponse(err.message));
        default:
            // Mặc định xử lý là lỗi server
            return res.status(statusCode).json(
                ResponseUtils.serverErrorResponse(
                    err.message || 'Đã xảy ra lỗi server',
                    {stack: err.stack}
                )
            );
    }
};

export default errorHandler;
