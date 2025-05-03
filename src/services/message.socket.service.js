import BaseSocketService from "./base.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";
import repos from "../repos/index.js";
import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";

class MessageSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Xử lý sự kiện gửi tin nhắn
        socket.on(SocketConstant.ON_MESSAGE_SEND, async (messageData) => {
            await this.handleNewMessage(socket, messageData, userId);
        });

        // Xử lý sự kiện xóa tin nhắn
        socket.on(SocketConstant.ON_MESSAGE_DELETE, async (data) => {
            await this.handleMessageDelete(socket, data, userId);
        });

        // Xử lý sự kiện thu hồi tin nhắn
        socket.on(SocketConstant.ON_MESSAGE_REVOKE, async (data) => {
            await this.handleMessageRevoke(socket, data, userId);
        });

        // Xử lý sự kiện đánh dấu tin nhắn đã đọc
        socket.on(SocketConstant.ON_MARK_MESSAGES_READ, async (data) => {
            await this.handleMarkMessagesRead(socket, data, userId);
        });

        // Xử lý sự kiện typing
        socket.on(SocketConstant.ON_TYPING, (data) => {
            this.handleTyping(socket, data, userId);
        });

        // Xử lý sự kiện stop typing
        socket.on(SocketConstant.ON_STOP_TYPING, (data) => {
            this.handleStopTyping(socket, data, userId);
        });
    }

    handleTyping(socket, data, userId) {
        const { conversationId } = data;

        const typingUser = {
            id: userId,
            _id: userId,
            name: socket.user.first_name || socket.user.name || "Unknown",
        };

        socket.to(`conversation:${conversationId}`).emit("user typing", {
            conversationId,
            user: typingUser,
        });
    }

    handleStopTyping(socket, data, userId) {
        const { conversationId } = data;

        const typingUser = {
            id: userId,
            _id: userId,
            name: socket.user.first_name || socket.user.name || "Unknown",
        };

        socket.to(`conversation:${conversationId}`).emit("user stop typing", {
            conversationId,
            user: typingUser,
        });
    }

    async handleNewMessage(socket, messageData, senderId) {
        try {
            const { conversationId, content, reply_to, files } = messageData;

            // Kiểm tra người gửi có thuộc conversation không
            const isParticipant =
                await repos.conversation.isUserParticipateInConversation(
                    conversationId,
                    senderId.toString()
                );

            if (!isParticipant) {
                socket.emit("message error", {
                    error: "You are not a participant of this conversation",
                });
                return;
            }

            // Tạo message mới
            const newMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(senderId),
                reply_to: reply_to ? mongoHelper.extractObjectId(reply_to) : null,
                content,
                files: files || [],
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(senderId),
                        read_at: new Date(),
                    },
                ],
            };

            // Cập nhật conversation với tin nhắn mới
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversationId) },
                {
                    $push: { messages: newMessage },
                    $set: {
                        last_message: {
                            content:
                                files && files.length > 0
                                    ? `[${files.length} file${files.length > 1 ? "s" : ""}]${
                                        content ? " " + content : ""
                                    }`
                                    : content,
                            sender_id: mongoHelper.extractObjectId(senderId),
                            timestamp: new Date(),
                        },
                    },
                }
            );

            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversationId) }
            );

            // Lấy danh sách người nhận (ngoại trừ người gửi)
            const receivers = conversation.participants.filter(
                (p) => {
                    const participantId = p._id || p.id || p.user_id;
                    return participantId && participantId.toString() !== senderId.toString();
                }
            );

            // Cập nhật unread_conversations cho mỗi người nhận
            for (const receiver of receivers) {
                await mongoHelper.updateOne(
                    DatabaseConstant.COLLECTIONS.USERS,
                    { _id: mongoHelper.extractObjectId(receiver._id) },
                    {
                        $pull: {
                            unread_conversations: {
                                conversation_id: mongoHelper.extractObjectId(conversationId),
                            },
                        },
                    }
                );

                await mongoHelper.updateOne(
                    DatabaseConstant.COLLECTIONS.USERS,
                    { _id: mongoHelper.extractObjectId(receiver._id) },
                    {
                        $push: {
                            unread_conversations: {
                                conversation_id: mongoHelper.extractObjectId(conversationId),
                                unread_count: 1,
                                last_unread_timestamp: new Date(),
                            },
                        },
                    }
                );
            }

            // Gửi tin nhắn tới tất cả người trong conversation
            this.io.to(`conversation:${conversationId}`).emit("new message", {
                conversation_id: conversationId,
                message: newMessage,
            });

            // Gửi thông báo cho những người nhận mà không có trong phòng
            for (const receiver of receivers) {
                const receiverId = receiver._id ? receiver._id.toString() : receiver.toString();
                // Kiểm tra xem người nhận có online không
                if (this.isUserOnline(receiverId)) {
                    const receiverSockets = this.getUserSockets(receiverId);
                    for (const receiverSocket of receiverSockets) {
                        // Kiểm tra xem socket này có trong phòng không
                        if (!receiverSocket.rooms.has(`conversation:${conversationId}`)) {
                            receiverSocket.emit("message notification", {
                                conversation_id: conversationId,
                                sender_id: senderId,
                                content:
                                    content.length > 50
                                        ? content.substring(0, 50) + "..."
                                        : content,
                                timestamp: new Date(),
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error handling new message:", error);
            socket.emit("message error", { error: "Failed to send message" });
        }
    }

    async handleMessageDelete(socket, data, userId) {
        try {
            const { conversationId, messageId } = data;

            // Validate input
            if (!conversationId || !messageId) {
                socket.emit("message delete error", {
                    error: "Missing required parameters",
                });
                return;
            }

            // Check if the conversation exists
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversationId) }
            );

            if (!conversation) {
                socket.emit("message delete error", {
                    error: "Conversation not found",
                });
                return;
            }

            // Find the message
            const messageIndex = conversation.messages.findIndex(
                (msg) => msg._id.toString() === messageId
            );

            if (messageIndex === -1) {
                socket.emit("message delete error", { error: "Message not found" });
                return;
            }

            const message = conversation.messages[messageIndex];

            // Check if the user has already deleted this message
            if (
                message.deleted_by &&
                message.deleted_by.some((id) => id.toString() === userId.toString())
            ) {
                socket.emit("message delete error", {
                    error: "You have already deleted this message",
                });
                return;
            }

            // Add the user to the deleted_by array
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    "messages._id": mongoHelper.extractObjectId(messageId),
                },
                {
                    $push: {
                        "messages.$.deleted_by": mongoHelper.extractObjectId(userId),
                    },
                }
            );

            // Notify only the user who deleted the message
            socket.emit("message deleted", {
                conversation_id: conversationId,
                message_id: messageId,
                deleted_by: userId,
            });
        } catch (error) {
            console.error("Error deleting message:", error);
            socket.emit("message delete error", {
                error: "Failed to delete message",
            });
        }
    }

    async handleMessageRevoke(socket, data, userId) {
        try {
            const { conversationId, messageId } = data;

            // Validate input
            if (!conversationId || !messageId) {
                socket.emit("message revoke error", {
                    error: "Missing required parameters",
                });
                return;
            }

            // Check if the conversation exists
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversationId) }
            );

            if (!conversation) {
                socket.emit("message revoke error", {
                    error: "Conversation not found",
                });
                return;
            }

            // Find the message
            const messageIndex = conversation.messages.findIndex(
                (msg) => msg._id.toString() === messageId
            );

            if (messageIndex === -1) {
                socket.emit("message revoke error", { error: "Message not found" });
                return;
            }

            const message = conversation.messages[messageIndex];

            // Check if the user is the sender of the message
            if (message.sender_id.toString() !== userId.toString()) {
                socket.emit("message revoke error", {
                    error: "You can only revoke your own messages",
                });
                return;
            }

            // Check if the message is already revoked
            if (message.is_revoked) {
                socket.emit("message revoke error", {
                    error: "This message has already been revoked",
                });
                return;
            }

            // Mark the message as revoked
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    "messages._id": mongoHelper.extractObjectId(messageId),
                },
                {
                    $set: { "messages.$.is_revoked": true },
                }
            );

            // Update last_message if it was the last message
            if (
                conversation.last_message &&
                conversation.messages[messageIndex]._id.toString() ===
                conversation.last_message._id?.toString()
            ) {
                await mongoHelper.updateOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    { _id: mongoHelper.extractObjectId(conversationId) },
                    {
                        $set: {
                            "last_message.content": "This message was revoked",
                        },
                    }
                );
            }

            // Notify all participants in the conversation about the revoked message
            this.io.to(`conversation:${conversationId}`).emit("message revoked", {
                conversation_id: conversationId,
                message_id: messageId,
                revoked_by: userId,
            });
        } catch (error) {
            console.error("Error revoking message:", error);
            socket.emit("message revoke error", {
                error: "Failed to revoke message",
            });
        }
    }

    async handleMarkMessagesRead(socket, data, userId) {
        try {
            const { conversationId } = data;

            // Kiểm tra conversation có tồn tại không
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversationId) }
            );

            if (!conversation) {
                socket.emit("read status error", { error: "Conversation not found" });
                return;
            }

            // Kiểm tra người đọc có thuộc conversation không
            const isParticipant = conversation.participants.some(
                (p) => (p._id || p.id || p.user_id)?.toString() === userId.toString()
            );

            if (!isParticipant) {
                socket.emit("read status error", {
                    error: "You are not a participant of this conversation",
                });
                return;
            }

            // Cập nhật trạng thái đã đọc cho tất cả tin nhắn chưa đọc
            const updateResult = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    messages: {
                        $elemMatch: {
                            sender_id: { $ne: mongoHelper.extractObjectId(userId) },
                            "read_by.user_id": { $ne: mongoHelper.extractObjectId(userId) },
                        },
                    },
                },
                {
                    $push: {
                        "messages.$[elem].read_by": {
                            user_id: mongoHelper.extractObjectId(userId),
                            read_at: new Date(),
                        },
                    },
                },
                {
                    arrayFilters: [
                        {
                            "elem.sender_id": { $ne: mongoHelper.extractObjectId(userId) },
                            "elem.read_by.user_id": {
                                $ne: mongoHelper.extractObjectId(userId),
                            },
                        },
                    ],
                    multi: true,
                }
            );

            // Xóa conversation khỏi danh sách unread_conversations của user
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: mongoHelper.extractObjectId(userId) },
                {
                    $pull: {
                        unread_conversations: {
                            conversation_id: mongoHelper.extractObjectId(conversationId),
                        },
                    },
                }
            );

            // Thông báo cho những người trong cuộc trò chuyện về việc tin nhắn đã được đọc
            this.io.to(`conversation:${conversationId}`).emit("messages read", {
                conversation_id: conversationId,
                user_id: userId,
                read_at: new Date(),
            });
        } catch (error) {
            console.error("Error marking messages as read:", error);
            socket.emit("read status error", {
                error: "Failed to mark messages as read",
            });
        }
    }
}

export default MessageSocketService;
