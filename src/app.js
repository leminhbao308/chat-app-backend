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
import mongoHelper from "./helper/MongoHelper.js";
import S3Middleware from "./middlewares/s3.middleware.js";
import s3Helper from "./helper/s3.helper.js";
import * as http from "node:http";
import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import ConversationRouter from "./routes/conversations.route.js";
import MessageRouter from "./routes/messages.route.js";
import UserProfileHelper from "./helper/userProfile.helper.js";

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
        this.connectedUsers = new Map();
        this.initializeMiddlewares();
        this.connectServices()
        this.initializeRoutes();
        this.handleErrors();
        this.setupGracefulShutdown();
        this.setupSocketIO();
    }

    initializeMiddlewares() {
        // Security middleware
        this.app.use(helmet());

        // Compression for performance
        this.app.use(compression());

        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true, // bật credentials: true để frontend có thể gửi cookie.
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
        this.app.use(ApiConstant.MESSAGES.ROOT_PATH, MessageRouter)
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

    setupSocketIO() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, decoded) => {
                    if (err) {
                        return next(new Error('Authentication error'));
                    }
                    socket.user = decoded;
                    next();
                });
            } else {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = socket.user.userId;
            console.log(`User ${userId} connected`);

            if (this.connectedUsers.has(userId)) {
                this.connectedUsers.get(userId).push(socket);
            } else {
                this.connectedUsers.set(userId, [socket]);
            }

            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                if (this.connectedUsers.has(userId)) {
                    const userSockets = this.connectedUsers.get(userId);
                    this.connectedUsers.set(userId, userSockets.filter(s => s !== socket));
                    if (userSockets.length === 0) {
                        this.connectedUsers.delete(userId);
                    }
                }
            });

            socket.on('chat message', async (msg) => {
                const {conversationId, content, senderId, receiverIds} = msg;
                console.log(`Message in conversation ${conversationId}: ${content}`);

                // Lưu tin nhắn vào database
                try {
                    await mongoHelper.insertOne('messages', {
                        conversationId,
                        senderId,
                        content,
                        receiverIds,
                        timestamp: new Date()
                    });
                } catch (error) {
                    console.error("Error saving message to DB:", error);
                    // Có thể emit một event thông báo lỗi cho người gửi
                    socket.emit('message_error', {message: "Failed to save message"});
                    return;
                }

                // Broadcast tin nhắn đến tất cả người nhận
                receiverIds.forEach(receiverId => {
                    if (this.connectedUsers.has(receiverId)) {
                        this.connectedUsers.get(receiverId).forEach(receiverSocket => {
                            receiverSocket.emit('chat message', {
                                conversationId,
                                content,
                                senderId,
                                receiverId,
                                timestamp: new Date()
                            });
                        });
                    }
                });
            });

            // Thêm các event mới
            socket.on('user info updated', (data) => {
                UserProfileHelper.broadcastUserInfo(this.getConnectedUsers(), userId, data);
            });

            socket.on('avatar updated', (avatarUrl) => {
                UserProfileHelper.broadcastAvatar(this.getConnectedUsers(), userId, avatarUrl);
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

    getIO() {
        return this.io;
    }

    getConnectedUsers() {
        return this.connectedUsers;
    }
}

// Export an instance or the class based on usage
export default new App();
