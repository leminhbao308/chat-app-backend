import BaseSocketService from "./base.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";

class ConnectionSocketService extends BaseSocketService {
    constructor(io, presenceService, notificationService) {
        super(io);
        this.presenceService = presenceService;
        this.notificationService = notificationService;
    }

    setupSocketIO() {
        this.setupAuth();

        this.io.on(SocketConstant.CONNECT, (socket) => {
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        const userId = socket.user.user_id;
        console.log(`User ${userId} connected`);

        // Lưu socket vào danh sách kết nối
        this.addSocketConnection(userId, socket);

        // Gửi danh sách các user đang online cho client
        this.presenceService.broadcastOnlineStatus();

        // Thông báo cho user về số tin nhắn chưa đọc
        this.notificationService.sendUnreadMessagesCount(userId);

        // Đăng ký các sự kiện cho socket
        this.registerSocketEvents(socket, userId);

        // Xử lý sự kiện ngắt kết nối
        socket.on(SocketConstant.DISCONNECT, () => {
            this.handleDisconnection(socket, userId);
        });
    }

    registerSocketEvents(socket, userId) {
        socket.on(SocketConstant.REQUEST_ONLINE_USER, () => {
            this.presenceService.broadcastOnlineStatus();
        });
    }

    handleDisconnection(socket, userId) {
        console.log(`User ${userId} disconnected`);

        // Xóa socket khỏi danh sách kết nối
        const isCompletelyOffline = this.removeSocketConnection(userId, socket);

        // Nếu user đã hoàn toàn offline (không còn kết nối nào)
        if (isCompletelyOffline) {
            // Thông báo cho tất cả users biết user này đã offline
            this.presenceService.broadcastOnlineStatus();
        }
    }
}

export default ConnectionSocketService;
