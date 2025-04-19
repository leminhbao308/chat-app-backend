import mongoHelper from '../helper/mongo.helper.js';
import ResponseUtils from '../utils/response.util.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";
import repos from "../repos/index.js";

const conversationController = {
    async createConversation(req, res) {
        try {
            const userId = req.user.user_id;
            const {participants} = req.body;

            if (!participants || !Array.isArray(participants)) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Participant IDs is required")
                );
            }

            // Đảm bảo người tạo cũng nằm trong danh sách participants
            const allParticipants = [...new Set([userId, ...participants])];

            // Kiểm tra xem tất cả người tham gia có tồn tại không
            for (const participantId of allParticipants) {
                const isUserExisted = await repos.auth.isUserExisting(participantId)

                if (!isUserExisted) {
                    return res.status(404).json({
                        message: `User with ID ${participantId} does not exist`
                    });
                }
            }

            // Kiểm tra xem đã có conversation giữa các participants này chưa (cho 1-1 conversation)
            if (allParticipants.length === 2) {
                const existingConversation = await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {
                        'participants': {$all: allParticipants.map(p => mongoHelper.extractObjectId(p)), $size: 2}
                    }
                );

                if (existingConversation) {
                    return res.status(200).json({
                        success: true,
                        data: existingConversation
                    });
                }
            }

            // Tạo conversation mới
            const newConversation = {
                participants: allParticipants.map(p => mongoHelper.extractObjectId(p)),
                created_at: new Date(),
                updated_at: new Date(),
                messages: [],
                name: null // Có thể thêm tên cho group chat nếu cần
            };

            const result = await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                newConversation
            );

            // Lấy lại conversation vừa tạo
            const createdConversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: result.insertedId}
            );

            res.status(StatusConstant.CREATED).json(
                ResponseUtils.successResponse(createdConversation)
            );
        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to create conversation")
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

            res.json(ResponseUtils.successResponse("Successfully get conversation",conversationsWithUnreadCount));
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

            res.json(ResponseUtils.successResponse({...conversation, unread_count: unreadInfo ? unreadInfo.unread_count : 0}));
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(ResponseUtils.serverErrorResponse("Failed to get conversations"));
        }
    }
};

export default conversationController;
