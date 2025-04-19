import jwt from "jsonwebtoken";
import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";
import SocketConstant from "../constants/socket.constant.js";
import repos from "../repos/index.js";

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> [socket1, socket2, ...]
    this.setupSocketIO();
  }

  setupSocketIO() {
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

    this.io.on(SocketConstant.CONNECT, (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    const userId = socket.user.user_id;
    console.log(`User ${userId} connected`);

    // Lưu socket vào danh sách kết nối
    if (this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId).push(socket);
    } else {
      this.connectedUsers.set(userId, [socket]);
    }

    // Gửi danh sách các user đang online cho client
    this.broadcastOnlineStatus();

    // Thông báo cho user về số tin nhắn chưa đọc
    this.sendUnreadMessagesCount(userId);

    socket.on(SocketConstant.REQUEST_ONLINE_USER, () => {
      this.broadcastOnlineStatus();
    });

    // Xử lý sự kiện ngắt kết nối
    socket.on(SocketConstant.DISCONNECT, () => {
      this.handleDisconnection(socket, userId);
    });

    // Xử lý sự kiện join room (conversation)
    socket.on(SocketConstant.ON_JOIN_CONVERSATION, (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Xử lý sự kiện rời khỏi room
    socket.on(SocketConstant.ON_LEAVE_CONVERSATION, (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

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

    // Xử lý sự kiện đang gõ
    // socket.on(SocketConstant.ON_TYPING, (data) => {
    //     const { conversationId } = data;
    //     socket.to(`conversation:${conversationId}`).emit('user typing', {
    //         userId,
    //         conversationId
    //     });
    // });
    socket.on(SocketConstant.ON_TYPING, (data) => {
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
    });

    // Xử lý sự kiện dừng gõ
    // socket.on(SocketConstant.ON_STOP_TYPING, (data) => {
    //     const { conversationId } = data;
    //     socket.to(`conversation:${conversationId}`).emit('user stop typing', {
    //         userId,
    //         conversationId
    //     });
    // });
    socket.on(SocketConstant.ON_STOP_TYPING, (data) => {
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
    });

    // Các event khác
    socket.on(SocketConstant.PROFILE.ON_INFO_UPDATED, (data) => {
      this.broadcastUserInfo(userId, data);
    });

    socket.on(SocketConstant.PROFILE.ON_AVATAR_UPDATED, (avatarUrl) => {
      this.broadcastAvatar(userId, avatarUrl);
    });

    // Thêm các event handler liên quan đến contact
    socket.on("contact request sent", (data) => {
      const { receiverId } = data;
      // Gửi thông báo cho người nhận nếu họ đang online
      if (this.connectedUsers.has(receiverId)) {
        const receiverSockets = this.connectedUsers.get(receiverId);
        for (const receiverSocket of receiverSockets) {
          receiverSocket.emit("new contact request", {
            sender_id: userId,
            timestamp: new Date(),
          });
        }
      }
    });

    socket.on("contact request accepted", (data) => {
      const { senderId } = data;
      // Gửi thông báo cho người gửi yêu cầu nếu họ đang online
      if (this.connectedUsers.has(senderId)) {
        const senderSockets = this.connectedUsers.get(senderId);
        for (const senderSocket of senderSockets) {
          senderSocket.emit("contact request accepted", {
            accepter_id: userId,
            timestamp: new Date(),
          });
        }
      }
    });
  }

  handleDisconnection(socket, userId) {
    console.log(`User ${userId} disconnected`);

    if (this.connectedUsers.has(userId)) {
      const userSockets = this.connectedUsers.get(userId);
      const updatedSockets = userSockets.filter((s) => s !== socket);

      if (updatedSockets.length === 0) {
        this.connectedUsers.delete(userId);
        // Thông báo cho tất cả users biết user này đã offline
        this.broadcastOnlineStatus();
      } else {
        this.connectedUsers.set(userId, updatedSockets);
      }
    }
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
        (p) => p._id.toString() !== senderId.toString()
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
      for (const receiverId of receivers) {
        // Kiểm tra xem người nhận có online không
        if (this.connectedUsers.has(receiverId.toString())) {
          const receiverSockets = this.connectedUsers.get(
            receiverId.toString()
          );
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

      // Check if the message is within the revoke time limit (e.g., 5 minutes)
      // const messageSentTime = new Date(message.send_timestamp);
      // const currentTime = new Date();
      // const timeDifferenceInMinutes = (currentTime - messageSentTime) / (1000 * 60);
      //
      // const REVOKE_TIME_LIMIT_MINUTES = 5; // Set your time limit here
      //
      // if (timeDifferenceInMinutes > REVOKE_TIME_LIMIT_MINUTES) {
      //     socket.emit('message revoke error', {
      //         error: `Messages can only be revoked within ${REVOKE_TIME_LIMIT_MINUTES} minutes of sending`
      //     });
      //     return;
      // }

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
      // const isParticipant = conversation.participants.some(
      //     p => p.toString() === userId.toString()
      // );
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

  async sendUnreadMessagesCount(userId) {
    try {
      // Lấy thông tin user bao gồm unread_conversations
      const user = await mongoHelper.findOne(
        DatabaseConstant.COLLECTIONS.USERS,
        { _id: mongoHelper.extractObjectId(userId) }
      );

      if (!user || !this.connectedUsers.has(userId)) return;

      const unreadConversations = user.unread_conversations || [];

      // Gửi thông tin các cuộc trò chuyện chưa đọc cho user
      for (const socket of this.connectedUsers.get(userId)) {
        socket.emit("unread messages", {
          unread_conversations: unreadConversations,
        });
      }
    } catch (error) {
      console.error("Error sending unread messages count:", error);
    }
  }

  broadcastOnlineStatus() {
    // Lấy danh sách userId đang online
    const onlineUsers = Array.from(this.connectedUsers.keys());

    // Gửi thông tin trạng thái online cho tất cả users
    this.io.emit("online users", {
      online_users: onlineUsers,
    });
  }

  broadcastUserInfo(userId, userData) {
    // Gửi thông tin cập nhật user cho tất cả users
    this.io.emit("emit user info updated", {
      user_id: userId,
      user_data: userData,
    });
  }

  broadcastAvatar(userId, avatarUrl) {
    // Gửi thông tin avatar mới cho tất cả users
    this.io.emit("avatar updated", {
      user_id: userId,
      avatar_url: avatarUrl,
    });
  }

  // Getter để lấy danh sách users đang online
  getConnectedUsers() {
    return this.connectedUsers;
  }
}

export default SocketService;
