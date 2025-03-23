import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan"
import usersRouter from "./routes/users.route.js"
import AuthRouter from "./routes/auth.route.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import ApiConstant from "./constants/apiConstant.js";
import mongoMiddleware from "./middlewares/mongoMiddleware.js";

const app = express();

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
