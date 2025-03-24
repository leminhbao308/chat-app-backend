import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan"
import usersRouter from "./routes/users.route.js"
import AuthRouter from "./routes/auth.route.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import ApiConstant from "./constants/apiConstant.js";
import mongoMiddleware from "./middlewares/mongoMiddleware.js";
import mongoHelper from "./helper/MongoHelper.js";

const app = express();

// Connect to MongoDB at application startup
(async () => {
    try {
        await mongoHelper.connect();
        console.log("MongoDB connected during application initialization");
    } catch (error) {
        console.error("Failed to establish initial MongoDB connection:", error);
        // You might want to exit the process here in development mode
        if (process.env.NODE_ENV === 'development') {
            console.error("Exiting application due to database connection failure");
            process.exit(1);
        }
    }
})();

// Set up graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoHelper.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Mongo setup
app.use(mongoMiddleware);

// Add more router here
app.use(ApiConstant.AUTH.ROOT_PATH, AuthRouter);
app.use(ApiConstant.USERS.ROOT_PATH, usersRouter);


//============ End of router adding===========//
// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
