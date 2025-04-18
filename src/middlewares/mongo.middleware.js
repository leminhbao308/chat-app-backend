import mongoHelper from "../helper/mongo.helper.js";
import StatusConstant from "../constants/status.constant.js";
import ResponseUtils from '../utils/response.util.js';

const MongoMiddleware = async (req, res, next) => {
  // Check MongoDB connection with early return
  if (!mongoHelper.isConnected()) {
    console.warn("MongoDB connection lost - potential service disruption");
    return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
        ResponseUtils.serverErrorResponse('Database connection unavailable')
    );
  }

  // Proceed with request
  next();
};

export default MongoMiddleware;
