import mongoHelper from '../helper/MongoHelper.js';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";

const MessageController = {
    async getMessagesInConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const messages = await mongoHelper.find(DatabaseConstant.COLLECTIONS.MESSAGES,
                { conversation_id: conversationId }, { sort: { timestamp: 1 } });
            res.json(ResponseUtils.successResponse(messages));
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR)
                .json(ResponseUtils.serverErrorResponse("Failed to get messages"));
        }
    }
};

export default MessageController;
