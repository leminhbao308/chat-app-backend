import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ApiConstant from "../constants/api.constant.js";
import controllers from "../controllers/index.js";

const ConversationRouter = express.Router();

ConversationRouter.get(
    ApiConstant.CONVERSATIONS.LIST.path,
    AuthMiddleware,
    controllers.conversation.getConversationsForUser
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.CREATE.path,
    AuthMiddleware,
    controllers.conversation.createConversation
);


export default ConversationRouter;
