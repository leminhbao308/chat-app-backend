// index.js
import BaseSocketService from "./base.socket.service.js";
import PresenceSocketService from "./presence.socket.service.js";
import NotificationSocketService from "./notification.socket.service.js";
import ProfileSocketService from "./profile.socket.service.js";
import MessageSocketService from "./message.socket.service.js";
import ConversationSocketService from "./conversation.socket.service.js";
import ContactSocketService from "./contact.socket.service.js";
import ConnectionSocketService from "./connection.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";

class SocketServiceManager {
    constructor(io) {
        this.io = io;

        // Khởi tạo các service
        this.baseService = new BaseSocketService(io);
        this.presenceService = new PresenceSocketService(io);
        this.notificationService = new NotificationSocketService(io);
        this.profileService = new ProfileSocketService(io);

        this.messageService = new MessageSocketService(io);
        this.conversationService = new ConversationSocketService(io);
        this.contactService = new ContactSocketService(io);

        // Khởi tạo connection service, sử dụng presence và noti service
        this.connectionService = new ConnectionSocketService(
            io,
            this.presenceService,
            this.notificationService
        );

        // Thực hiện setup socket io
        this.setupSocketIO();
    }

    setupSocketIO() {
        // Sử dụng Auth middileware để tận dụng access token cho việc xác thực socket
        this.baseService.setupAuth();

        this.io.on(SocketConstant.CONNECT, (socket) => {
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        const userId = socket.user.user_id;

        // Thiết lập socket cho user id tương ứng
        this.baseService.addSocketConnection(userId, socket);

        // Gửi trạng thái online đến các client khác
        this.presenceService.broadcastOnlineStatus();

        // Gửi thông báo về số tin nhắn chưa đọc
        this.notificationService.sendUnreadMessagesCount(userId);

        // Đăng ký sự kiện cho các event socket
        this.registerAllSocketEvents(socket, userId);

        socket.on(SocketConstant.DISCONNECT, () => {
            this.handleDisconnection(socket, userId);
        });
    }

    registerAllSocketEvents(socket, userId) {
        this.messageService.registerSocketEvents(socket, userId);
        this.conversationService.registerSocketEvents(socket, userId);
        this.contactService.registerSocketEvents(socket, userId);
        this.profileService.registerSocketEvents(socket, userId);
        this.connectionService.registerSocketEvents(socket, userId);
        this.notificationService.registerSocketEvents(socket, userId);
    }

    handleDisconnection(socket, userId) {
        const isCompletelyOffline = this.baseService.removeSocketConnection(userId, socket);

        if (isCompletelyOffline) {
            this.presenceService.broadcastOnlineStatus();
        }
    }

    getConnectedUsers() {
        return this.baseService.connectedUsers;
    }
}

export default function initializeSocketServices(io) {
    return new SocketServiceManager(io);
}
