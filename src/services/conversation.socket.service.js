import BaseSocketService from "./base.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";

class ConversationSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Xử lý sự kiện join room (conversation)
        socket.on(SocketConstant.ON_JOIN_CONVERSATION, (conversationId) => {
            this.joinConversation(socket, conversationId);
        });

        // Xử lý sự kiện rời khỏi room
        socket.on(SocketConstant.ON_LEAVE_CONVERSATION, (conversationId) => {
            this.leaveConversation(socket, conversationId);
        });
    }

    joinConversation(socket, conversationId) {
        socket.join(`conversation:${conversationId}`);
    }

    leaveConversation(socket, conversationId) {
        socket.leave(`conversation:${conversationId}`);
    }
}

export default ConversationSocketService;
