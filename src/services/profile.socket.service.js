import BaseSocketService from "./base.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";

class ProfileSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Các event khác
        socket.on(SocketConstant.PROFILE.ON_INFO_UPDATED, (data) => {
            this.broadcastUserInfo(userId, data);
        });

        socket.on(SocketConstant.PROFILE.ON_AVATAR_UPDATED, (avatarUrl) => {
            this.broadcastAvatar(userId, avatarUrl);
        });
    }

    broadcastUserInfo(userId, userData) {
        // Gửi thông tin cập nhật user cho tất cả users
        this.broadcastToAllUsers(
            SocketConstant.PROFILE.EMIT_INFO_UPDATED,
            {
                user_id: userId,
                user_data: userData,
            }
        );
    }

    broadcastAvatar(userId, avatarUrl) {
        // Gửi thông tin avatar mới cho tất cả users
        this.broadcastToAllUsers(
            SocketConstant.PROFILE.ON_AVATAR_UPDATED,
            {
                user_id: userId,
                avatar_url: avatarUrl,
            }
        );
    }
}

export default ProfileSocketService;
