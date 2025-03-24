import ResponseUtils from '../utils/response.js';
import StatusConstant from "../constants/statusConstant.js";

/**
 * Error Handler Middleware
 * Processes and formats errors with standard responses
 */
const errorHandler = (err, req, res, next) => {
    // Development environment logging
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    // Error type mappings
    const errorTypeHandlers = {
        'ValidationError': () => ({
            status: StatusConstant.BAD_REQUEST,
            response: ResponseUtils.badRequestResponse('Dữ liệu không hợp lệ.', err.details)
        }),
        'JsonWebTokenError': () => ({
            status: StatusConstant.UNAUTHORIZED,
            response: ResponseUtils.unauthorizedResponse('Token không hợp lệ hoặc đã hết hạn')
        }),
        'TokenExpiredError': () => ({
            status: StatusConstant.UNAUTHORIZED,
            response: ResponseUtils.unauthorizedResponse('Token đã hết hạn')
        })
    };

    // Check for specific error type handlers
    const specificHandler = errorTypeHandlers[err.name];
    if (specificHandler) {
        const { status, response } = specificHandler();
        return res.status(status).json(response);
    }

    // Default error handling based on status code
    const statusCode = err.statusCode || StatusConstant.INTERNAL_SERVER_ERROR;
    const errorResponses = {
        [StatusConstant.BAD_REQUEST]: () => ResponseUtils.badRequestResponse(err.message),
        [StatusConstant.UNAUTHORIZED]: () => ResponseUtils.unauthorizedResponse(err.message),
        [StatusConstant.NOT_FOUND]: () => ResponseUtils.notFoundResponse(err.message),
        [StatusConstant.INTERNAL_SERVER_ERROR]: () => ResponseUtils.serverErrorResponse(
            err.message || 'Có lỗi xảy ra phía server',
            { stack: err.stack }
        )
    };

    const responseHandler = errorResponses[statusCode] || errorResponses[StatusConstant.INTERNAL_SERVER_ERROR];
    return res.status(statusCode).json(responseHandler());
};

export default errorHandler;
