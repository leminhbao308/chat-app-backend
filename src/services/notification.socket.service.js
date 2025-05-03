import BaseSocketService from "./base.socket.service.js";
import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";
import SocketConstant from "../constants/socket.constant.js";

class NotificationSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Không cần đăng ký events ở đây, chủ yếu là phương thức hỗ trợ
    }

    async sendUnreadMessagesCount(userId) {
        try {
            // Lấy thông tin user bao gồm unread_conversations
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: mongoHelper.extractObjectId(userId)}
            );

            if (!user || !this.isUserOnline(userId)) return;

            const unreadConversations = user.unread_conversations || [];

            // Gửi thông tin các cuộc trò chuyện chưa đọc cho user
            this.emitToUser(
                userId,
                SocketConstant.CONVERSATION.ON_UNREAD_MESSAGE,
                {unread_conversations: unreadConversations                }
            );
        } catch (error) {
            console.error("Error sending unread messages count:", error);
        }
    }
}

export default NotificationSocketService;
