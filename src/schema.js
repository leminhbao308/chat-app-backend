/**
 * NoSQL Database Schema cho Zalo-like Chat App
 * Sử dụng MongoDB collections và document structure
 */

// Users Collection - Lưu trữ thông tin người dùng
db.users = {
    _id: ObjectId, // MongoDB ID
    phoneNumber: String, // Số điện thoại (unique)
    email: String, // Email (optional)
    password: String, // Mật khẩu đã hash
    fullName: String, // Tên đầy đủ
    displayName: String, // Tên hiển thị
    avatar: String, // URL ảnh đại diện
    status: {
        online: Boolean, // Trạng thái online/offline
        lastActive: Date, // Thời gian hoạt động cuối cùng
        statusMessage: String, // Tin nhắn trạng thái
    },
    devices: [
        {
            deviceId: String, // ID thiết bị
            deviceName: String, // Tên thiết bị
            lastLogin: Date, // Thời gian đăng nhập cuối
            pushToken: String, // Token cho push notification
        }
    ],
    settings: {
        privacy: {
            whoCanSeeMyStatus: String, // "everyone", "contacts", "nobody"
            whoCanSeeMyAvatar: String, // "everyone", "contacts", "nobody"
            whoCanAddMe: String, // "everyone", "nobody"
            readReceipts: Boolean, // Xác nhận đã đọc
        },
        notifications: {
            messages: Boolean, // Bật/tắt thông báo tin nhắn
            groupMessages: Boolean, // Bật/tắt thông báo nhóm
            calls: Boolean, // Bật/tắt thông báo cuộc gọi
        },
        theme: String, // "light", "dark", "system"
    },
    verified: Boolean, // Tài khoản đã xác thực chưa
    createdAt: Date, // Ngày tạo tài khoản
    updatedAt: Date, // Ngày cập nhật gần nhất
    index: [
        { phoneNumber: 1 }, // Đánh index cho tìm kiếm theo số điện thoại
        { email: 1 }, // Đánh index cho tìm kiếm theo email
        { "status.online": 1 } // Đánh index cho tìm kiếm trạng thái online
    ]
};

// Contacts Collection - Quản lý mối quan hệ bạn bè
db.contacts = {
    _id: ObjectId,
    userId: ObjectId, // Ref to user
    contactId: ObjectId, // Ref to contact user
    nickname: String, // Biệt danh do người dùng đặt cho liên hệ này
    relationship: String, // "friend", "blocked", "pending"
    conversationId: ObjectId, // Ref to 1-1 conversation
    createdAt: Date,
    updatedAt: Date,
    index: [
        { userId: 1 }, // Tìm tất cả liên hệ của một người dùng
        { contactId: 1 }, // Tìm tất cả người dùng có liên hệ với một người
        { userId: 1, relationship: 1 }, // Tìm tất cả bạn bè của một người
        { userId: 1, contactId: 1 }, // Kiểm tra quan hệ giữa hai người dùng
    ]
};

// FriendRequests Collection - Quản lý lời mời kết bạn
db.friendRequests = {
    _id: ObjectId,
    senderId: ObjectId, // Người gửi lời mời
    receiverId: ObjectId, // Người nhận lời mời
    status: String, // "pending", "accepted", "rejected"
    message: String, // Tin nhắn kèm theo lời mời
    createdAt: Date,
    updatedAt: Date,
    index: [
        { senderId: 1 }, // Tìm lời mời đã gửi
        { receiverId: 1 }, // Tìm lời mời đã nhận
        { receiverId: 1, status: 1 } // Tìm lời mời đang chờ
    ]
};

// Conversations Collection - Quản lý cuộc trò chuyện
db.conversations = {
    _id: ObjectId,
    type: String, // "individual", "group"
    name: String, // Tên nhóm (đối với group chat)
    avatar: String, // Ảnh nhóm (đối với group chat)
    participants: [
        {
            userId: ObjectId, // Ref to user
            role: String, // "admin", "member" (for groups)
            joinedAt: Date,
            isActive: Boolean, // Người dùng còn trong nhóm hay đã rời
        }
    ],
    lastMessage: {
        messageId: ObjectId, // Ref to the last message
        text: String, // Preview of the last message
        senderId: ObjectId, // Ref to the sender
        sentAt: Date,
        type: String, // "text", "image", "video", etc.
    },
    settings: {
        isArchived: Boolean, // Đã lưu trữ
        isPinned: Boolean, // Đã ghim
        isMuted: Boolean, // Đã tắt thông báo
        muteExpiration: Date, // Thời gian hết hạn tắt thông báo
    },
    metadata: {
        createdBy: ObjectId, // Người tạo cuộc trò chuyện
        createdAt: Date,
        updatedAt: Date,
    },
    index: [
        { "participants.userId": 1 }, // Tìm tất cả cuộc trò chuyện của một người dùng
        { "participants.userId": 1, "settings.isPinned": -1, "lastMessage.sentAt": -1 }, // Sắp xếp theo ghim và thời gian
        { type: 1 } // Tìm theo loại cuộc trò chuyện
    ]
};

// Messages Collection - Lưu trữ tin nhắn
db.messages = {
    _id: ObjectId,
    conversationId: ObjectId, // Ref to conversation
    senderId: ObjectId, // Ref to user who sent
    replyTo: ObjectId, // Ref to replied message (optional)
    forwardFrom: ObjectId, // Ref to forwarded message (optional)
    type: String, // "text", "image", "video", "audio", "file", "sticker", "location"
    content: {
        text: String, // Nội dung tin nhắn văn bản
        mediaUrl: String, // URL to media
        fileName: String, // Tên file nếu có
        fileSize: Number, // Kích thước file
        duration: Number, // Thời lượng (audio/video)
        thumbnail: String, // URL to thumbnail
        location: {
            latitude: Number,
            longitude: Number,
            address: String
        }
    },
    reactions: [
        {
            userId: ObjectId, // Người thả reaction
            type: String, // "like", "love", "haha", "wow", "sad", "angry"
            createdAt: Date
        }
    ],
    readBy: [
        {
            userId: ObjectId, // Người đã đọc tin nhắn
            readAt: Date // Thời gian đọc
        }
    ],
    status: String, // "sent", "delivered", "read", "failed", "deleted"
    isEdited: Boolean, // Tin nhắn đã được chỉnh sửa chưa
    editHistory: [
        {
            content: String, // Nội dung trước khi chỉnh sửa
            editedAt: Date // Thời điểm chỉnh sửa
        }
    ],
    createdAt: Date,
    updatedAt: Date,
    index: [
        { conversationId: 1, createdAt: -1 }, // Lấy tin nhắn theo cuộc trò chuyện, sắp xếp theo thời gian
        { senderId: 1 }, // Tìm tin nhắn theo người gửi
        { conversationId: 1, status: 1 }, // Tìm tin nhắn chưa đọc trong cuộc trò chuyện
        { "content.text": "text" } // Full-text search cho nội dung tin nhắn
    ]
};

// Media Collection - Lưu trữ phương tiện của tin nhắn
db.media = {
    _id: ObjectId,
    userId: ObjectId, // Người upload
    messageId: ObjectId, // Tin nhắn liên quan
    conversationId: ObjectId, // Cuộc trò chuyện liên quan
    type: String, // "image", "video", "audio", "file"
    url: String, // URL để truy cập
    thumbnailUrl: String, // URL thumbnail nếu có
    originalName: String, // Tên file gốc
    size: Number, // Kích thước byte
    mimeType: String, // Loại MIME
    duration: Number, // Thời lượng (cho audio/video)
    metadata: {
        width: Number, // Chiều rộng (cho ảnh/video)
        height: Number, // Chiều cao (cho ảnh/video)
        codec: String, // Codec (cho audio/video)
    },
    createdAt: Date,
    index: [
        { conversationId: 1, type: 1 }, // Tìm phương tiện theo cuộc trò chuyện và loại
        { userId: 1 }, // Tìm phương tiện theo người dùng
        { messageId: 1 } // Tìm phương tiện theo tin nhắn
    ]
};

// Calls Collection - Lưu trữ cuộc gọi
db.calls = {
    _id: ObjectId,
    type: String, // "audio", "video"
    participants: [
        {
            userId: ObjectId, // Người tham gia
            status: String, // "initiated", "ringing", "accepted", "rejected", "missed", "ended"
            joinedAt: Date, // Thời điểm tham gia
            leftAt: Date, // Thời điểm rời đi
        }
    ],
    initiator: ObjectId, // Người bắt đầu cuộc gọi
    conversationId: ObjectId, // Liên kết với cuộc trò chuyện nếu có
    duration: Number, // Thời lượng cuộc gọi (giây)
    status: String, // "ongoing", "ended", "missed"
    recordingUrl: String, // URL recording nếu có
    startedAt: Date, // Thời điểm bắt đầu
    endedAt: Date, // Thời điểm kết thúc
    index: [
        { "participants.userId": 1 }, // Tìm cuộc gọi theo người tham gia
        { conversationId: 1 }, // Tìm cuộc gọi theo cuộc trò chuyện
        { startedAt: -1 } // Sắp xếp theo thời gian bắt đầu
    ]
};

// Notifications Collection - Lưu trữ thông báo
db.notifications = {
    _id: ObjectId,
    userId: ObjectId, // Người nhận thông báo
    type: String, // "message", "friend_request", "call", "system"
    title: String, // Tiêu đề thông báo
    body: String, // Nội dung
    data: {
        conversationId: ObjectId, // Liên kết đến cuộc trò chuyện
        messageId: ObjectId, // Liên kết đến tin nhắn
        senderId: ObjectId, // Liên kết đến người gửi
        requestId: ObjectId, // Liên kết đến yêu cầu kết bạn
        callId: ObjectId, // Liên kết đến cuộc gọi
    },
    isRead: Boolean, // Đã đọc chưa
    createdAt: Date,
    index: [
        { userId: 1, isRead: 1, createdAt: -1 }, // Tìm thông báo chưa đọc theo người dùng
        { "data.conversationId": 1 } // Tìm thông báo theo cuộc trò chuyện
    ]
};

// UserActivities Collection - Theo dõi hoạt động của người dùng
db.userActivities = {
    _id: ObjectId,
    userId: ObjectId, // Người dùng
    type: String, // "login", "logout", "message_sent", "call", "profile_update"
    metadata: {
        ip: String, // Địa chỉ IP
        deviceInfo: String, // Thông tin thiết bị
        location: {
            country: String,
            city: String,
            coordinates: [Number, Number] // [longitude, latitude]
        }
    },
    createdAt: Date,
    index: [
        { userId: 1, createdAt: -1 }, // Tìm hoạt động theo người dùng
        { type: 1, createdAt: -1 } // Tìm các loại hoạt động theo thời gian
    ]
};

// Reports Collection - Quản lý báo cáo
db.reports = {
    _id: ObjectId,
    reporterId: ObjectId, // Người báo cáo
    targetType: String, // "user", "message", "group"
    targetId: ObjectId, // ID của đối tượng bị báo cáo
    reason: String, // Lý do báo cáo
    description: String, // Mô tả chi tiết
    status: String, // "pending", "reviewing", "resolved", "dismissed"
    moderatorId: ObjectId, // Người xử lý báo cáo
    resolution: String, // Cách giải quyết
    createdAt: Date,
    resolvedAt: Date,
    index: [
        { targetId: 1 }, // Tìm báo cáo theo đối tượng
        { status: 1 }, // Tìm báo cáo theo trạng thái
        { reporterId: 1 } // Tìm báo cáo theo người báo cáo
    ]
};

// TypingStatus Collection - Lưu trữ trạng thái đang nhập (có thể lưu cache/redis)
db.typingStatus = {
    _id: ObjectId,
    userId: ObjectId, // Người dùng đang nhập
    conversationId: ObjectId, // Cuộc trò chuyện đang nhập
    timestamp: Date, // Thời điểm gần nhất cập nhật trạng thái
    index: [
        { conversationId: 1 }, // Tìm tất cả người dùng đang nhập trong cuộc trò chuyện
        { userId: 1, conversationId: 1 } // Tìm trạng thái nhập của người dùng trong cuộc trò chuyện
    ]
};
