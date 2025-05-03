import BaseSocketService from "./base.socket.service.js";

class ContactSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Handle contact request sent event
        socket.on("contact request sent", (data) => {
            this.handleContactRequestSent(userId, data);
        });

        // Handle contact request accepted event
        socket.on("contact request accepted", (data) => {
            this.handleContactRequestAccepted(userId, data);
        });
    }

    handleContactRequestSent(senderId, data) {
        const { receiverId } = data;

        // Check if receiver is online before sending notification
        if (this.isUserOnline(receiverId)) {
            // Send notification to receiver if they are online
            this.emitToUser(receiverId, "new contact request", {
                sender_id: senderId,
                timestamp: new Date()
            });
        }
    }

    handleContactRequestAccepted(accepterId, data) {
        const { senderId } = data;

        // Send notification to the original request sender if they are online
        this.emitToUser(senderId, "contact request accepted", {
            accepter_id: accepterId,
            timestamp: new Date()
        });
    }
}

export default ContactSocketService;
