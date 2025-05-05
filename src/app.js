import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import UsersRouter from "./routes/users.route.js";
import AuthRouter from "./routes/auth.route.js";
import NotFoundMiddleware from "./middlewares/notFound.middleware.js";
import ErrorMiddleware from "./middlewares/error.middleware.js";
import ApiConstant from "./constants/api.constant.js";
import MongoMiddleware from "./middlewares/mongo.middleware.js";
import mongoHelper from "./helper/mongo.helper.js";
import S3Middleware from "./middlewares/s3.middleware.js";
import s3Helper from "./helper/s3.helper.js";
import * as http from "node:http";
import {Server} from "socket.io";
import ConversationRouter from "./routes/conversations.route.js";
import MessageRouter from "./routes/messages.route.js";
import SocketRouter from "./routes/socket.route.js";
import ContactRouter from "./routes/contacts.route.js";
import SwaggerRouter from "./routes/swagger.route.js";
import MediaRouter from "./routes/media.route.js";
import initializeSocketServices from "./services/index.js";

class App {
    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new Server(this.httpServer, {       // Initialize Socket.IO
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                methods: ["GET", "POST"]
            }
        });
        this.socketServiceManager = null; // Will be initialized after connections are established
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

        const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5000', 'http://localhost:3000'];

        this.app.use(cors({
            origin: (origin, callback) => {
                if (allowedOrigins.includes(origin) || !origin) { // Allow requests with no origin (e.g., same-origin)
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Logging
        this.app.use(logger(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

        // Body parsing
        this.app.use(express.json({limit: '10mb'}));
        this.app.use(express.urlencoded({extended: true, limit: '10mb'}));

        // Cookie parsing
        this.app.use(cookieParser());

        // Database and storage middleware
        this.app.use(MongoMiddleware);
        this.app.use(S3Middleware);
    }

    initializeRoutes() {
        // Add routes
        this.app.use(ApiConstant.AUTH.ROOT_PATH, AuthRouter);
        this.app.use(ApiConstant.USERS.ROOT_PATH, UsersRouter);
        this.app.use(ApiConstant.CONVERSATIONS.ROOT_PATH, ConversationRouter);
        this.app.use(ApiConstant.MESSAGES.ROOT_PATH, MessageRouter);
        this.app.use(ApiConstant.WEBSOCKET.ROOT_PATH, SocketRouter);
        this.app.use(ApiConstant.CONTACTS.ROOT_PATH, ContactRouter);
        this.app.use(ApiConstant.MEDIA.ROOT_PATH, MediaRouter);

        // Add Swagger Documents
        this.app.use("/api-docs", SwaggerRouter);
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
        this.initializeSocketService();
    }

    initializeSocketService() {
        // Initialize the socket service manager with io instance
        this.socketServiceManager = initializeSocketServices(this.getIO());
        console.log("- Socket.IO services initialized");
    }

    async connectDatabase() {
        try {
            await mongoHelper.connect();
            console.log("- MongoDB connected successfully");
        } catch (error) {
            console.error("- MongoDB connection failed:\n", error);

            // Critical error handling in development
            if (process.env.NODE_ENV === 'development') {
                console.error("- Exiting application due to database connection failure");
                process.exit(1);
            }
        }
    }

    async connectStorage() {
        try {
            await s3Helper.connect();
            console.log("- AWS S3 connected successfully");
        } catch (error) {
            console.error("- AWS S3 connection failed: \n", error);

            console.warn("- Exiting application due to storage connection failure");
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

        signals.forEach(signal => {
            process.on(signal, async () => {
                try {
                    console.log(`- Received ${signal}. Starting graceful shutdown...`);

                    // Close database connection
                    await mongoHelper.close();
                    console.log('- MongoDB connection closed');

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
                    console.error('- Graceful shutdown error:', error);
                    process.exit(1);
                }
            });
        });
    }

    listen(port) {
        this.httpServer.listen(port, () => {
        });
        return this.httpServer;
    }

    getApp() {
        return this.app;
    }

    getIO() {
        return this.io;
    }

    getSocketServiceManager() {
        return this.socketServiceManager;
    }

    getConnectedUsers() {
        return this.socketServiceManager ? this.socketServiceManager.getConnectedUsers() : new Map();
    }
}

// Export an instance or the class based on usage
export default new App();
