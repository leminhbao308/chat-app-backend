import ResponseUtils from '../utils/response.util.js';
import StatusConstant from '../constants/status.constant.js';

const NotFoundMiddleware = (req, res, next) => {
    res.status(StatusConstant.NOT_FOUND).json(
        ResponseUtils.notFoundResponse(`Không tìm thấy route - ${req.originalUrl}`)
    );
};

export default NotFoundMiddleware;
