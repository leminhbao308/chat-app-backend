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

        // Initialize services that don't have dependencies
        this.baseService = new BaseSocketService(io);
        this.presenceService = new PresenceSocketService(io);
        this.notificationService = new NotificationSocketService(io);
        this.profileService = new ProfileSocketService(io);

        // Initialize services with dependencies
        this.messageService = new MessageSocketService(io);
        this.conversationService = new ConversationSocketService(io);
        this.contactService = new ContactSocketService(io);

        // Initialize the connection service last, with dependencies
        this.connectionService = new ConnectionSocketService(
            io,
            this.presenceService,
            this.notificationService
        );

        // Setup socket IO with all services
        this.setupSocketIO();
    }

    setupSocketIO() {
        // Setup authentication middleware
        this.baseService.setupAuth();

        // Setup connection handlers
        this.io.on(SocketConstant.CONNECT, (socket) => {
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        const userId = socket.user.user_id;
        console.log(`User ${userId} connected`);

        // Store socket connection
        this.baseService.addSocketConnection(userId, socket);

        // Send online status to all users
        this.presenceService.broadcastOnlineStatus();

        // Send unread messages count
        this.notificationService.sendUnreadMessagesCount(userId);

        // Register events for all services
        this.registerAllSocketEvents(socket, userId);

        // Handle disconnection
        socket.on(SocketConstant.DISCONNECT, () => {
            this.handleDisconnection(socket, userId);
        });
    }

    registerAllSocketEvents(socket, userId) {
        // Register events for each service
        this.messageService.registerSocketEvents(socket, userId);
        this.conversationService.registerSocketEvents(socket, userId);
        this.contactService.registerSocketEvents(socket, userId);
        this.profileService.registerSocketEvents(socket, userId);
        this.connectionService.registerSocketEvents(socket, userId);
        this.notificationService.registerSocketEvents(socket, userId);
    }

    handleDisconnection(socket, userId) {
        console.log(`User ${userId} disconnected`);

        // Remove socket from connections
        const isCompletelyOffline = this.baseService.removeSocketConnection(userId, socket);

        // If user is completely offline (no more connections)
        if (isCompletelyOffline) {
            // Broadcast updated online status
            this.presenceService.broadcastOnlineStatus();
        }
    }

    // Getter to access the list of connected users
    getConnectedUsers() {
        return this.baseService.connectedUsers;
    }
}

export default function initializeSocketServices(io) {
    return new SocketServiceManager(io);
}
