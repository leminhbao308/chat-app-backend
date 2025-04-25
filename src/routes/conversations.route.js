import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ApiConstant from "../constants/api.constant.js";
import controllers from "../controllers/index.js";

const ConversationRouter = express.Router();

// Existing routes
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

ConversationRouter.get(
    ApiConstant.CONVERSATIONS.GET.path,
    AuthMiddleware,
    controllers.conversation.getConversationsById
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.UPDATE.path,
    AuthMiddleware,
    controllers.conversation.updateConversationsById
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.ADD_MEMBER.path,
    AuthMiddleware,
    controllers.conversation.addMemberToGroup
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.REMOVE_MEMBER.path,
    AuthMiddleware,
    controllers.conversation.removeMemberFromGroup
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.CHANGE_ROLE.path,
    AuthMiddleware,
    controllers.conversation.changeMemberRole
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.UPDATE_SETTINGS.path,
    AuthMiddleware,
    controllers.conversation.updateGroupSettings
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.LEAVE_GROUP.path,
    AuthMiddleware,
    controllers.conversation.leaveGroup
);

ConversationRouter.post(
    ApiConstant.CONVERSATIONS.DISSOLVE_GROUP.path,
    AuthMiddleware,
    controllers.conversation.dissolveGroup
);

export default ConversationRouter;
