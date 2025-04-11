import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import usersRouter from "./routes/users.route.js";
import AuthRouter from "./routes/auth.route.js";
import NotFoundMiddleware from "./middlewares/notFound.middleware.js";
import ErrorMiddleware from "./middlewares/error.middleware.js";
import ApiConstant from "./constants/api.constant.js";
import MongoMiddleware from "./middlewares/mongo.middleware.js";
import mongoHelper from "./helper/MongoHelper.js";
import S3Middleware from "./middlewares/s3.middleware.js";
import s3Helper from "./helper/s3.helper.js";

class App {
    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.connectServices()
        this.initializeRoutes();
        this.handleErrors();
        this.setupGracefulShutdown();
    }

    initializeMiddlewares() {
        // Security middleware
        this.app.use(helmet());

        // Compression for performance
        this.app.use(compression());

        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Logging
        this.app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Cookie parsing
        this.app.use(cookieParser());

        // Database and storage middleware
        this.app.use(MongoMiddleware);
        this.app.use(S3Middleware);
    }

    initializeRoutes() {
        // Add routes
        this.app.use(ApiConstant.AUTH.ROOT_PATH, AuthRouter);
        this.app.use(ApiConstant.USERS.ROOT_PATH, usersRouter);
    }

    handleErrors() {
        // 404 handler
        this.app.use(NotFoundMiddleware);

        // Error handler
        this.app.use(ErrorMiddleware);
    }

    async connectServices() {
        await this.connectDatabase();
        await this.connectStorage();
    }

    async connectDatabase() {
        try {
            await mongoHelper.connect();
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("MongoDB connection failed:", error);

            // Critical error handling in development
            if (process.env.NODE_ENV === 'development') {
                console.error("Exiting application due to database connection failure");
                process.exit(1);
            }
        }
    }

    async connectStorage() {
        try {
            await s3Helper.connect();
            console.log("AWS S3 connected successfully");
        } catch (error) {
            console.error("AWS S3 connection failed:", error);

            console.warn("Exiting application due to storage connection failure");
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

        signals.forEach(signal => {
            process.on(signal, async () => {
                try {
                    console.log(`Received ${signal}. Starting graceful shutdown...`);

                    // Close database connection
                    await mongoHelper.close();
                    console.log('MongoDB connection closed');

                    // Close server if initialized
                    if (this.server) {
                        this.server.close(() => {
                            console.log('HTTP server closed');
                            process.exit(0);
                        });
                    } else {
                        process.exit(0);
                    }
                } catch (error) {
                    console.error('Graceful shutdown error:', error);
                    process.exit(1);
                }
            });
        });
    }

    listen(port) {
        this.server = this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        return this.server;
    }

    getApp() {
        return this.app;
    }
}

// Export an instance or the class based on usage
export default new App();
