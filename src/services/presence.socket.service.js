import BaseSocketService from "./base.socket.service.js";

class PresenceSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    broadcastOnlineStatus() {
        // Lấy danh sách userId đang online
        const onlineUsers = this.getOnlineUsers();

        // Gửi thông tin trạng thái online cho tất cả users
        this.broadcastToAllUsers("online users", {
            online_users: onlineUsers,
        });
    }

    registerSocketEvents(socket, userId) {
        // Không cần đăng ký events ở đây vì đã xử lý ở ConnectionSocketService
    }
}

export default PresenceSocketService;
