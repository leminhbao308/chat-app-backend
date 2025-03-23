import mongoHelper from "../helper/MongoHelper.js";

const mongoMiddleware = async (req, res, next) => {
  try {
    // Check if MongoDB is connected, if not, connect
    if (!mongoHelper.isConnected()) {
      await mongoHelper.connect();
    }
    console.log("Successfully establish MongoDB connection!");
    next();
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error. Please try again later.'
    });
  }
}

export default mongoMiddleware;