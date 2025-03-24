import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/statusConstant.js';

const notFound = (req, res, next) => {
    res.status(StatusConstant.NOT_FOUND).json(
        ResponseUtils.notFoundResponse(`Không tìm thấy route - ${req.originalUrl}`)
    );
};

export default notFound;
