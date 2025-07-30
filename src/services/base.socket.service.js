import jwt from "jsonwebtoken";

class BaseSocketService {
    constructor(io) {
        this.io = io;
        this.connectedUsers = new Map(); // userId -> [socket1, socket2, ...]
    }

    setupAuth() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token;
            if (token) {
                jwt.verify(
                    token,
                    process.env.JWT_SECRET || "your-secret-key",
                    (err, decoded) => {
                        if (err) {
                            return next(new Error("Authentication error"));
                        }
                        socket.user = decoded;
                        next();
                    }
                );
            } else {
                next(new Error("Authentication error"));
            }
        });
    }

    registerSocketEvents(socket, userId) {
        // Các services khác sẽ override phương thức này
    }

    // Lưu socket vào danh sách kết nối
    addSocketConnection(userId, socket) {
        if (this.connectedUsers.has(userId)) {
            this.connectedUsers.get(userId).push(socket);
        } else {
            this.connectedUsers.set(userId, [socket]);
        }
    }

    // Xóa socket khỏi danh sách kết nối
    removeSocketConnection(userId, socket) {
        if (this.connectedUsers.has(userId)) {
            const userSockets = this.connectedUsers.get(userId);
            const updatedSockets = userSockets.filter((s) => s !== socket);

            if (updatedSockets.length === 0) {
                this.connectedUsers.delete(userId);
                return true; // User hoàn toàn offline
            } else {
                this.connectedUsers.set(userId, updatedSockets);
                return false; // User vẫn còn kết nối khác
            }
        }
        return false;
    }

    // Kiểm tra user có online hay không
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    // Lấy tất cả socket của một user
    getUserSockets(userId) {
        return this.connectedUsers.get(userId) || [];
    }

    // Lấy danh sách user đang online
    getOnlineUsers() {
        return Array.from(this.connectedUsers.keys());
    }

    // Gửi event đến một user cụ thể
    emitToUser(userId, event, data) {
        if (this.isUserOnline(userId)) {
            const userSockets = this.getUserSockets(userId);
            for (const socket of userSockets) {
                socket.emit(event, data);
            }
        }
    }

    // Broadcast event đến tất cả users
    broadcastToAllUsers(event, data) {
        this.io.emit(event, data);
    }
}

export default BaseSocketService;
