import mongoHelper from '../helper/mongo.helper.js';
import ResponseUtils from '../utils/response.util.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";
import repos from "../repos/index.js";

const conversationController = {
    async createConversation(req, res) {
        try {
            const userId = req.user.user_id;
            const { participants, group_name } = req.body;

            if (!participants || !Array.isArray(participants)) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Participant IDs is required")
                );
            }

            // Đảm bảo người tạo cũng nằm trong danh sách participants
            const allParticipants = [...new Set([userId, ...participants])];

            // Kiểm tra xem tất cả người tham gia có tồn tại không
            for (const participantId of allParticipants) {
                const isUserExisted = await repos.auth.isUserExisting(participantId);

                if (!isUserExisted) {
                    return res.status(StatusConstant.NOT_FOUND).json(
                        ResponseUtils.notFoundResponse(`User with ID ${participantId} does not exist`)
                    );
                }
            }

            let conversation;

            // Quyết định loại conversation dựa trên số lượng người tham gia
            if (allParticipants.length === 2) {
                // Tạo conversation 1-1
                conversation = await repos.conversation.createConversationForContacts(
                    allParticipants[0],
                    allParticipants[1]
                );
            } else {
                // Tạo conversation nhóm
                conversation = await repos.conversation.createConversationForGroup(
                    allParticipants,
                    group_name || "New Group"
                );
            }

            if (!conversation) {
                return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                    ResponseUtils.serverErrorResponse("Failed to create conversation")
                );
            }

            res.status(StatusConstant.CREATED).json(
                ResponseUtils.successResponse(conversation)
            );

        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("An error occur while creating conversation")
            );
        }
    },

    async getConversationsForUser(req, res) {
        try {
            const userId = req.user.user_id;

            // Tìm các cuộc trò chuyện mà user tham gia
            const conversations = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {'participants._id': mongoHelper.extractObjectId(userId)}
            );

            // Lấy thông tin unread_conversations từ user
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: mongoHelper.extractObjectId(userId)}
            );

            const unreadConversations = user?.unread_conversations || [];

            // Thêm thông tin unread_count vào từng conversation
            const conversationsWithUnreadCount = conversations.map(conv => {
                const unreadInfo = unreadConversations.find(
                    uc => uc.conversation_id.toString() === conv._id.toString()
                );

                return {
                    ...conv,
                    unread_count: unreadInfo ? unreadInfo.unread_count : 0
                };
            });

            res.status(StatusConstant.OK).json(ResponseUtils.successResponse("Successfully get conversations", conversationsWithUnreadCount));
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(ResponseUtils.serverErrorResponse("Failed to get conversations"));
        }
    },
    async getConversationsById(req, res) {
        try {
            const {id: conversationId} = req.params;
            const userId = req.user.user_id;

            // Tìm cuộc trò chuyện mà user tham gia
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    'participants._id': mongoHelper.extractObjectId(userId)
                }
            );

            // Lấy thông tin unread_conversations từ user
            const user = repos.auth.getUserById(userId);

            const unreadConversations = user?.unread_conversations || [];

            // Thêm thông tin unread_count vào từng conversation
            const unreadInfo = unreadConversations.find(
                uc => uc.conversation_id.toString() === conversation._id.toString()
            );

            res.status(StatusConstant.OK)
                .json(ResponseUtils.successResponse("Successfully get conversations", {
                    ...conversation,
                    unread_count: unreadInfo ? unreadInfo.unread_count : 0
                }));
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(ResponseUtils.serverErrorResponse("Failed to get conversations"));
        }
    }
};

export default conversationController;
