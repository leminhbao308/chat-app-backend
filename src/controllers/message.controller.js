import mongoHelper from '../helper/MongoHelper.js';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";

const MessageController = {
    async getMessagesInConversation(req, res) {
        try {
            const {conversationId} = req.params;
            const userId = req.user.user_id;

            // Kiểm tra conversation có tồn tại và user có quyền xem không
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    participants: mongoHelper.extractObjectId(userId)
                }
            );

            if (!conversation) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.notFoundResponse("Conversation not found or access denied")
                );
            }

            // Lấy danh sách tin nhắn và sắp xếp theo thời gian
            const messages = conversation.messages || [];

            // Trả về messages
            res.json(ResponseUtils.successResponse(messages));
        } catch (error) {
            console.error("Error getting messages:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR)
                .json(ResponseUtils.serverErrorResponse("Failed to get messages"));
        }
    },

    async markMessagesAsRead(req, res) {
        try {
            const {conversationId} = req.params;
            const userId = req.user.user_id;

            // Kiểm tra conversation có tồn tại và user có quyền không
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    participants: mongoHelper.extractObjectId(userId)
                }
            );

            if (!conversation) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.notFoundResponse("Conversation not found or access denied")
                );
            }

            // Cập nhật trạng thái đã đọc cho tất cả tin nhắn chưa đọc
            // Chỉ cập nhật tin nhắn từ người khác gửi đến
            const updateResult = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    "messages": {
                        $elemMatch: {
                            "sender_id": {$ne: mongoHelper.extractObjectId(userId)},
                            "read_by.user_id": {$ne: mongoHelper.extractObjectId(userId)}
                        }
                    }
                },
                {
                    $push: {
                        "messages.$[elem].read_by": {
                            user_id: mongoHelper.extractObjectId(userId),
                            read_at: new Date()
                        }
                    }
                },
                {
                    arrayFilters: [
                        {
                            "elem.sender_id": {$ne: mongoHelper.extractObjectId(userId)},
                            "elem.read_by.user_id": {$ne: mongoHelper.extractObjectId(userId)}
                        }
                    ],
                    multi: true
                }
            );

            // Xóa conversation khỏi danh sách unread_conversations của user
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: mongoHelper.extractObjectId(userId)},
                {
                    $pull: {
                        unread_conversations: {
                            conversation_id: mongoHelper.extractObjectId(conversationId)
                        }
                    }
                }
            );

            res.json(ResponseUtils.successResponse(
                "Messages marked as read",
                updateResult.modifiedCount > 0
            ));
        } catch (error) {
            console.error("Error marking messages as read:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR)
                .json(ResponseUtils.serverErrorResponse("Failed to mark messages as read"));
        }
    }
};

export default MessageController;
