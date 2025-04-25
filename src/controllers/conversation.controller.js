import mongoHelper from '../helper/mongo.helper.js';
import ResponseUtils from '../utils/response.util.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from "../constants/database.constant.js";
import repos from "../repos/index.js";
import GroupConstants from "../constants/group.constants.js";

const conversationController = {
    async createConversation(req, res) {
        try {
            const userId = req.user.user_id;
            const {participants, group_name} = req.body;

            if (!participants || !Array.isArray(participants)) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Participant IDs is required")
                );
            }

            // Kiểm tra xem tất cả người tham gia có tồn tại không
            for (const participantId of participants) {
                const isUserExisted = await repos.auth.isUserExisting(participantId);

                if (!isUserExisted) {
                    return res.status(StatusConstant.NOT_FOUND).json(
                        ResponseUtils.notFoundResponse(`User with ID ${participantId} does not exist`)
                    );
                }
            }

            let conversation;

            // Quyết định loại conversation dựa trên số lượng người tham gia
            if (participants.length === 1) {
                // Tạo conversation 1-1
                conversation = await repos.conversation.createConversationForContacts(
                    userId,
                    participants[1]
                );
            } else {
                // Tạo conversation nhóm
                conversation = await repos.conversation.createConversationForGroup(
                    userId,
                    participants,
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
            const user = await repos.auth.getUserById(userId);

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
    },

    async updateConversationsById(req, res) {
        try {
            const {id: conversationId} = req.params;
            const userId = req.user.user_id;
            const data = req.body;

            if (!data || Object.keys(data).length === 0) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Không có dữ liệu cần cập nhật")
                );
            }

            const updatedConversation = await repos.conversation.updateConversationInfo(conversationId, userId, data);

            if (!updatedConversation) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền cập nhật hoặc dữ liệu không hợp lệ")
                );
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(
                    "Cập nhật thông tin cuộc trò chuyện thành công",
                    updatedConversation
                ));
        } catch (error) {
            console.error("Error updating conversations:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi cập nhật thông tin cuộc trò chuyện")
            );
        }
    },

    // Add member to group
    async addMemberToGroup(req, res) {
        try {
            const {id: conversationId} = req.params;
            const {new_participants: userIds} = req.body;
            const adminId = req.user.user_id;

            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Danh sách thành viên không hợp lệ")
                );
            }

            const result = await repos.conversation.addMembersToGroup(conversationId, adminId, userIds);

            if (!result) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền thêm thành viên hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Thêm thành viên vào nhóm thành công",
                data: result
            });
        } catch (error) {
            console.error("Error adding members to group:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi thêm thành viên vào nhóm")
            );
        }
    },

    // Remove member from group
    async removeMemberFromGroup(req, res) {
        try {
            const {id: conversationId} = req.params;
            const {participant_id: memberId} = req.body;
            const adminId = req.user.user_id;

            const result = await repos.conversation.removeMemberFromGroup(conversationId, adminId, memberId);

            if (!result) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền xóa thành viên hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Xóa thành viên khỏi nhóm thành công",
                data: result
            });
        } catch (error) {
            console.error("Error removing member from group:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi xóa thành viên khỏi nhóm")
            );
        }
    },

    // Change member role
    async changeMemberRole(req, res) {
        try {
            const {id: conversationId} = req.params;
            const {participant_id: memberId, new_role: role} = req.body;
            const adminId = req.user.user_id;

            if (!Object.values(GroupConstants.ROLES).includes(role)) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Vai trò không hợp lệ")
                );
            }

            const result = await repos.conversation.changeMemberRole(conversationId, adminId, memberId, role);

            if (!result) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền thay đổi vai trò hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Thay đổi vai trò thành viên thành công",
                data: result
            });
        } catch (error) {
            console.error("Error changing member role:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi thay đổi vai trò thành viên")
            );
        }
    },

    // Update group settings
    async updateGroupSettings(req, res) {
        try {
            const {id: conversationId} = req.params;
            const {settings} = req.body;
            const adminId = req.user.user_id;

            if (!settings || Object.keys(settings).length === 0) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Không có cài đặt cần cập nhật")
                );
            }

            const result = await repos.conversation.updateGroupSettings(conversationId, adminId, settings);

            if (!result) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền cập nhật cài đặt hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Cập nhật cài đặt nhóm thành công",
                data: result
            });
        } catch (error) {
            console.error("Error updating group settings:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi cập nhật cài đặt nhóm")
            );
        }
    },

    // Leave group
    async leaveGroup(req, res) {
        try {
            const {id: conversationId} = req.params;
            const userId = req.user.user_id;

            const result = await repos.conversation.leaveGroup(conversationId, userId);

            if (!result) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Không thể rời nhóm hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Rời nhóm thành công",
                data: result
            });
        } catch (error) {
            console.error("Error leaving group:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi rời nhóm")
            );
        }
    },

    // Dissolve group
    async dissolveGroup(req, res) {
        try {
            const {id: conversationId} = req.params;
            const adminId = req.user.user_id;

            const result = await repos.conversation.dissolveGroup(conversationId, adminId);

            if (!result) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse("Không có quyền giải thể nhóm hoặc nhóm không tồn tại")
                );
            }

            return res.status(StatusConstant.OK).json({
                success: true,
                message: "Giải thể nhóm thành công",
                data: result
            });
        } catch (error) {
            console.error("Error dissolving group:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Lỗi khi giải thể nhóm")
            );
        }
    }
};

export default conversationController;
