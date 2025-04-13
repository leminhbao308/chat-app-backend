import mongoHelper from '../helper/MongoHelper.js';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";

const conversationController = {
    async getConversationsForUser(req, res) {
        try {
            const userId = req.user.user_id; // Lấy userId từ JWT
            const conversations = await mongoHelper.find(DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { participants: userId });
            res.json(ResponseUtils.successResponse(conversations));
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(ResponseUtils.serverErrorResponse("Failed to get conversations"));
        }
    }
};

export default conversationController;
