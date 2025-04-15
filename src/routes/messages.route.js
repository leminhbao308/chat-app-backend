import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ApiConstant from "../constants/api.constant.js";
import controllers from "../controllers/index.js";

const MessageRouter = express.Router();

MessageRouter.get(
    ApiConstant.MESSAGES.LIST.path,
    AuthMiddleware,
    controllers.message.getMessagesInConversation
);

// Đánh dấu tin nhắn đã đọc
MessageRouter.put(
    ApiConstant.MESSAGES.MARK_READ.path,
    AuthMiddleware,
    controllers.message.markMessagesAsRead
);

export default MessageRouter;
