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

export default MessageRouter;
