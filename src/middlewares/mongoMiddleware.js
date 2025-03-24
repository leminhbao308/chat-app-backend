import mongoHelper from "../helper/MongoHelper.js";
import StatusConstant from "../constants/statusConstant.js";

const mongoMiddleware = async (req, res, next) => {
  try {
    // Check if MongoDB is connected
    if (!mongoHelper.isConnected()) {
      console.warn("MongoDB not connected in middleware - this should not happen in normal operation");
      return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json({
        success: false,
        describe: 'Database connection error. Please try again later.'
      });
    }

    next();
  } catch (error) {
    console.error('MongoDB middleware error:', error);
    return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json({
      success: false,
      describe: 'Database error. Please try again later.'
    });
  }
}

export default mongoMiddleware;
