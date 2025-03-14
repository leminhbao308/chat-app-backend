/**
 * Not Found middleware
 * This middleware handles requests for routes that don't exist
 */

import ResponseUtils from '../utils/response.js';

// Express 404 middleware function
const notFound = (req, res, next) => {
    // Trả về response với định dạng chuẩn
    res.status(404).json(
        ResponseUtils.notFoundResponse(`Không tìm thấy route - ${req.originalUrl}`)
    );
    next();
};

export default notFound;
