/**
 * API Route Constants cho Zalo-like Chat Application
 * Định nghĩa tất cả các đường dẫn API và methods tập trung vào chức năng chat
 */
const ApiConstant = {

    // Authentication Routes
    AUTH: {
        ROOT_PATH: "/auth",
        // POST /register - Đăng ký tài khoản mới
        REGISTER: {
            path: '/register',
            method: 'post',
            description: 'Đăng ký tài khoản mới'
        },
        // POST /login - Đăng nhập
        LOGIN: {
            path: '/login',
            method: 'post',
            description: 'Đăng nhập'
        },
        // POST /logout - Đăng xuất
        LOGOUT: {
            path: '/logout',
            method: 'post',
            description: 'Đăng xuất'
        },
        // POST /refresh-token - Làm mới token xác thực
        REFRESH_TOKEN: {
            path: '/refresh-token',
            method: 'post',
            description: 'Làm mới token xác thực'
        },
        // POST /change-password - Yêu cầu thay đổi mật khẩu
        CHANGE_PASSWORD: {
            path: '/change-password',
            method: 'post',
            description: 'Yêu cầu thay đổi mật khẩu'
        },
        RESET_PASSWORD: {
            path: '/reset-password',
            method: 'post',
            description: 'Đặt lại mật khẩu'
        },
        // GET /me - Lấy thông tin người dùng hiện tại
        ME: {
            path: '/me',
            method: 'get',
            description: 'Lấy thông tin người dùng hiện tại'
        }
    },

    // User Routes
    USERS: {
        ROOT_PATH: '/users',
        // GET /search - Tìm kiếm người dùng
        SEARCH: {
            path: '/search',
            method: 'get',
            description: 'Tìm kiếm người dùng qua số điện thoại hoặc ID'
        },
        // GET /:id - Lấy thông tin chi tiết của người dùng
        DETAIL: {
            path: '/:id',
            method: 'get',
            description: 'Lấy thông tin chi tiết của người dùng',
        },
        // PUT /update-info - Cập nhật thông tin người dùng
        UPDATE: {
            path: '/update-info',
            method: 'put',
            description: 'Cập nhật thông tin người dùng',
        },
        // PUT /status - Cập nhật trạng thái người dùng
        UPDATE_STATUS: {
            path: '/status',
            method: 'put',
            description: 'Cập nhật trạng thái người dùng',
        },
        // POST /profile-picture - Cập nhật ảnh đại diện
        PROFILE_PICTURE: {
            path: '/profile-picture',
            method: 'post',
            description: 'Cập nhật ảnh đại diện'
        },
        // PUT /profile-picture/old - Lấy danh sách ảnh đại diện cũ
        PROFILE_PICTURE_OLD: {
            path: '/profile-picture/old',
            method: 'get',
            description: 'Lấy danh sách ảnh đại diện cũ'
        }

    },

    // Contacts/Friends Routes
    CONTACTS: {
        ROOT_PATH: "/contacts",
        // GET /contacts - Lấy danh sách liên hệ/bạn bè
        LIST: {
            path: '/list',
            method: 'get',
            description: 'Lấy danh sách liên hệ/bạn bè'
        },
        // POST /contacts/:userId/add - Gửi lời mời kết bạn
        ADD: {
            path: '/:userId/add',
            method: 'post',
            description: 'Gửi lời mời kết bạn'
        },
        // GET /contacts/requests - Lấy danh sách lời mời kết bạn đang chờ
        REQUESTS: {
            path: '/requests',
            method: 'get',
            description: 'Lấy danh sách lời mời kết bạn đang chờ'
        },
        // GET /contacts/sent-requests - Lấy danh sách lời mời kết bạn đã gửi
        SENT_REQUESTS: {
            path: '/sent-requests',
            method: 'get',
            description: 'Lấy danh sách lời mời kết bạn đã gửi'
        },
        // POST /contacts/:requestId/accept - Chấp nhận lời mời kết bạn
        ACCEPT: {
            path: '/:requestId/accept',
            method: 'post',
            description: 'Chấp nhận lời mời kết bạn'
        },
        // POST /contacts/:requestId/reject - Từ chối lời mời kết bạn
        REJECT: {
            path: '/:requestId/reject',
            method: 'post',
            description: 'Từ chối lời mời kết bạn'
        },
        // POST /contacts/:userId/delete - Xóa liên hệ/bạn bè
        REMOVE: {
            path: '/:userId/delete',
            method: 'post',
            description: 'Xóa liên hệ/bạn bè'
        },
        // POST /contacts/:userId/block - Chặn người dùng
        BLOCK: {
            path: '/:userId/block',
            method: 'post',
            description: 'Chặn người dùng'
        },
        // POST /contacts/:userId/unblock - Bỏ chặn người dùng
        UNBLOCK: {
            path: '/:userId/unblock',
            method: 'post',
            description: 'Bỏ chặn người dùng'
        },
        // GET /contacts/blocked - Lấy danh sách người dùng bị chặn
        BLOCKED: {
            path: '/blocked',
            method: 'get',
            description: 'Lấy danh sách người dùng bị chặn'
        }
    },

    // Conversation Routes
    CONVERSATIONS: {
        ROOT_PATH: '/conversations',
        // GET /conversations - Lấy tất cả cuộc trò chuyện của người dùng
        LIST: {
            path: '/all',
            method: 'get',
            description: 'Lấy tất cả cuộc trò chuyện của người dùng'
        },
        // GET /conversations/:id - Lấy cuộc trò chuyện của người dùng theo id
        GET: {
            path: '/:id',
            method: 'post',
            description: 'Lấy cuộc trò chuyện của người dùng theo id'
        },
        // POST /conversations - Tạo cuộc trò chuyện mới
        CREATE: {
            path: '/new',
            method: 'post',
            description: 'Tạo cuộc trò chuyện mới'
        },
        // GET /conversations/:id/detail - Lấy thông tin chi tiết về cuộc trò chuyện
        DETAIL: {
            path: '/:id/detail',
            method: 'get',
            description: 'Lấy thông tin chi tiết về cuộc trò chuyện',
        },
        // POST /conversations/:id - Cập nhật thông tin cuộc trò chuyện
        UPDATE: {
            path: '/:id',
            method: 'post',
            description: 'Cập nhật thông tin cuộc trò chuyện (tên, ảnh)',
            pathWithParams: (id) => `/conversations/${id}`
        },
        // POST /conversations/:id/archive - Lưu trữ cuộc trò chuyện
        ARCHIVE: {
            path: '/:id/archive',
            method: 'post',
            description: 'Lưu trữ cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/archive`
        },
        // POST /conversations/:id/unarchive - Bỏ lưu trữ cuộc trò chuyện
        UNARCHIVE: {
            path: '/:id/unarchive',
            method: 'post',
            description: 'Bỏ lưu trữ cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unarchive`
        },
        // POST /conversations/:id/pin - Ghim cuộc trò chuyện
        PIN: {
            path: '/:id/pin',
            method: 'post',
            description: 'Ghim cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/pin`
        },
        // POST /conversations/:id/unpin - Bỏ ghim cuộc trò chuyện
        UNPIN: {
            path: '/:id/unpin',
            method: 'post',
            description: 'Bỏ ghim cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unpin`
        },
        // POST /conversations/:id/mute - Tắt thông báo cuộc trò chuyện
        MUTE: {
            path: '/:id/mute',
            method: 'post',
            description: 'Tắt thông báo cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/mute`
        },
        // POST /conversations/:id/unmute - Bật thông báo cuộc trò chuyện
        UNMUTE: {
            path: '/:id/unmute',
            method: 'post',
            description: 'Bật thông báo cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unmute`
        }
    },

    // Message Routes
    MESSAGES: {
        ROOT_PATH: '/messages',
        // GET /messages/:conversationId - Lấy tin nhắn trong cuộc trò chuyện
        LIST: {
            path: '/:conversationId',
            method: 'get',
            description: 'Lấy tin nhắn trong cuộc trò chuyện (phân trang)'
        },
        // POST /messages/:conversationId - Gửi tin nhắn mới
        SEND: {
            path: '/:conversationId',
            method: 'post',
            description: 'Gửi tin nhắn mới'
        },
        // POST /messages/:conversationId/edit/:messageId - Cập nhật/sửa tin nhắn
        UPDATE: {
            path: '/:conversationId/edit/:messageId',
            method: 'post',
            description: 'Cập nhật/sửa tin nhắn'
        },
        // POST /messages/:conversationId/delete/:messageId - Xóa tin nhắn
        DELETE: {
            path: '/:conversationId/delete/:messageId',
            method: 'post',
            description: 'Xóa tin nhắn'
        },
        // POST /messages/:conversationId/reaction/:messageId/add - Thêm biểu cảm vào tin nhắn
        REACT: {
            path: '/:conversationId/reaction/:messageId/add',
            method: 'post',
            description: 'Thêm biểu cảm vào tin nhắn'
        },
        // DELETE /messages/:conversationId/reaction/:messageId/remove/:reactionId - Xóa biểu cảm
        REMOVE_REACT: {
            path: '/:conversationId/reaction/:messageId/remove/:reactionId',
            method: 'post',
            description: 'Xóa biểu cảm khỏi tin nhắn'
        },
        // // GET /conversations/:conversationId/messages/:messageId/read-receipts - Lấy trạng thái đã đọc
        // READ_RECEIPTS: {
        //     path: '/conversations/:conversationId/messages/:messageId/read-receipts',
        //     method: 'get',
        //     description: 'Lấy trạng thái đã đọc của tin nhắn',
        //     pathWithParams: (conversationId, messageId) =>
        //         `/conversations/${conversationId}/messages/${messageId}/read-receipts`
        // },
        // POST /messages/:conversationId/read - Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
        MARK_READ: {
            path: '/:conversationId/read',
            method: 'post',
            description: 'Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện'
        }
    },

    // Group Chat Routes
    GROUPS: {
        // POST /groups - Tạo nhóm chat mới
        CREATE: {
            path: '/groups',
            method: 'post',
            description: 'Tạo nhóm chat mới'
        },
        // GET /groups/:id - Lấy thông tin nhóm
        DETAIL: {
            path: '/groups/:id',
            method: 'get',
            description: 'Lấy thông tin nhóm',
            pathWithParams: (id) => `/groups/${id}`
        },
        // PUT /groups/:id - Cập nhật thông tin nhóm
        UPDATE: {
            path: '/groups/:id',
            method: 'put',
            description: 'Cập nhật thông tin nhóm',
            pathWithParams: (id) => `/groups/${id}`
        },
        // POST /groups/:id/members - Thêm thành viên vào nhóm
        ADD_MEMBER: {
            path: '/groups/:id/members',
            method: 'post',
            description: 'Thêm thành viên vào nhóm',
            pathWithParams: (id) => `/groups/${id}/members`
        },
        // DELETE /groups/:id/members/:userId - Xóa thành viên khỏi nhóm
        REMOVE_MEMBER: {
            path: '/groups/:id/members/:userId',
            method: 'delete',
            description: 'Xóa thành viên khỏi nhóm',
            pathWithParams: (id, userId) => `/groups/${id}/members/${userId}`
        },
        // PUT /groups/:id/members/:userId/role - Thay đổi vai trò của thành viên
        CHANGE_ROLE: {
            path: '/groups/:id/members/:userId/role',
            method: 'put',
            description: 'Thay đổi vai trò của thành viên (admin/member)',
            pathWithParams: (id, userId) => `/groups/${id}/members/${userId}/role`
        },
        // POST /groups/:id/leave - Rời khỏi nhóm
        LEAVE: {
            path: '/groups/:id/leave',
            method: 'post',
            description: 'Rời khỏi nhóm',
            pathWithParams: (id) => `/groups/${id}/leave`
        },
        // GET /groups/:id/members - Lấy danh sách thành viên nhóm
        MEMBERS: {
            path: '/groups/:id/members',
            method: 'get',
            description: 'Lấy danh sách thành viên nhóm',
            pathWithParams: (id) => `/groups/${id}/members`
        },
        // PUT /groups/:id/image - Cập nhật ảnh nhóm
        UPDATE_IMAGE: {
            path: '/groups/:id/image',
            method: 'put',
            description: 'Cập nhật ảnh nhóm',
            pathWithParams: (id) => `/groups/${id}/image`
        }
    },

    // Media Routes
    MEDIA: {
        // POST /media/upload - Tải lên tệp đa phương tiện
        UPLOAD: {
            path: '/media/upload',
            method: 'post',
            description: 'Tải lên tệp đa phương tiện (hình ảnh, video, âm thanh, tệp)'
        },
        // GET /media/:id - Lấy tệp đa phương tiện
        GET: {
            path: '/media/:id',
            method: 'get',
            description: 'Lấy tệp đa phương tiện',
            pathWithParams: (id) => `/media/${id}`
        },
        // DELETE /media/:id - Xóa tệp đa phương tiện
        DELETE: {
            path: '/media/:id',
            method: 'delete',
            description: 'Xóa tệp đa phương tiện',
            pathWithParams: (id) => `/media/${id}`
        },
        // GET /conversations/:conversationId/media - Lấy tất cả phương tiện trong cuộc trò chuyện
        CONVERSATION_MEDIA: {
            path: '/conversations/:conversationId/media',
            method: 'get',
            description: 'Lấy tất cả phương tiện trong cuộc trò chuyện',
            pathWithParams: (conversationId) => `/conversations/${conversationId}/media`
        }
    },

    // Call Routes
    CALLS: {
        // POST /calls/initiate - Bắt đầu cuộc gọi
        INITIATE: {
            path: '/calls/initiate',
            method: 'post',
            description: 'Bắt đầu cuộc gọi'
        },
        // PUT /calls/:id/answer - Trả lời cuộc gọi
        ANSWER: {
            path: '/calls/:id/answer',
            method: 'put',
            description: 'Trả lời cuộc gọi',
            pathWithParams: (id) => `/calls/${id}/answer`
        },
        // PUT /calls/:id/end - Kết thúc cuộc gọi
        END: {
            path: '/calls/:id/end',
            method: 'put',
            description: 'Kết thúc cuộc gọi',
            pathWithParams: (id) => `/calls/${id}/end`
        },
        // PUT /calls/:id/reject - Từ chối cuộc gọi
        REJECT: {
            path: '/calls/:id/reject',
            method: 'put',
            description: 'Từ chối cuộc gọi',
            pathWithParams: (id) => `/calls/${id}/reject`
        },
        // GET /calls/history - Lấy lịch sử cuộc gọi
        HISTORY: {
            path: '/calls/history',
            method: 'get',
            description: 'Lấy lịch sử cuộc gọi'
        },
        // PUT /calls/:id/toggle-video - Bật/tắt video
        TOGGLE_VIDEO: {
            path: '/calls/:id/toggle-video',
            method: 'put',
            description: 'Bật/tắt video',
            pathWithParams: (id) => `/calls/${id}/toggle-video`
        },
        // PUT /calls/:id/toggle-mute - Bật/tắt âm thanh
        TOGGLE_MUTE: {
            path: '/calls/:id/toggle-mute',
            method: 'put',
            description: 'Bật/tắt âm thanh',
            pathWithParams: (id) => `/calls/${id}/toggle-mute`
        }
    },

    // Notification Routes
    NOTIFICATIONS: {
        // GET /notifications - Lấy tất cả thông báo
        LIST: {
            path: '/notifications',
            method: 'get',
            description: 'Lấy tất cả thông báo'
        },
        // PUT /notifications/:id/read - Đánh dấu thông báo đã đọc
        MARK_READ: {
            path: '/notifications/:id/read',
            method: 'put',
            description: 'Đánh dấu thông báo đã đọc',
            pathWithParams: (id) => `/notifications/${id}/read`
        },
        // PUT /notifications/read-all - Đánh dấu tất cả thông báo đã đọc
        MARK_ALL_READ: {
            path: '/notifications/read-all',
            method: 'put',
            description: 'Đánh dấu tất cả thông báo đã đọc'
        },
        // PUT /notifications/settings - Cập nhật cài đặt thông báo
        UPDATE_SETTINGS: {
            path: '/notifications/settings',
            method: 'put',
            description: 'Cập nhật cài đặt thông báo'
        }
    },

    // Settings Routes
    SETTINGS: {
        // GET /settings - Lấy cài đặt người dùng
        GET: {
            path: '/settings',
            method: 'get',
            description: 'Lấy cài đặt người dùng'
        },
        // PUT /settings - Cập nhật cài đặt người dùng
        UPDATE: {
            path: '/settings',
            method: 'put',
            description: 'Cập nhật cài đặt người dùng'
        },
        // PUT /settings/privacy - Cập nhật cài đặt quyền riêng tư
        UPDATE_PRIVACY: {
            path: '/settings/privacy',
            method: 'put',
            description: 'Cập nhật cài đặt quyền riêng tư'
        },
        // GET /settings/devices - Lấy danh sách thiết bị đăng nhập
        DEVICES: {
            path: '/settings/devices',
            method: 'get',
            description: 'Lấy danh sách thiết bị đăng nhập'
        },
        // DELETE /settings/devices/:id - Đăng xuất khỏi thiết bị cụ thể
        LOGOUT_DEVICE: {
            path: '/settings/devices/:id',
            method: 'delete',
            description: 'Đăng xuất khỏi thiết bị cụ thể',
            pathWithParams: (id) => `/settings/devices/${id}`
        }
    },

    // WebSocket Routes
    WEBSOCKET: {
        ROOT_PATH: "/ws",
        CONSTANTS: {
            path: '/constants',
            method: 'get'
        },
        GET_CONVERSATIONS: {
            path: "/conversations",
            description: "Lấy danh sách cuộc trò chuyện cho người dùng hiện tại"
        },
        USER_STATUS: {
            path: "/user-status",
            description: "Kiểm tra trạng thái trực tuyến của người dùng"
        },
        UPDATE_STATUS: {
            path: "/update-status",
            description: "Cập nhật trạng thái trực tuyến của người dùng"
        },
        // /ws/connect - Kết nối WebSocket
        CONNECT: {
            path: '/connect',
            description: 'Kết nối WebSocket'
        },
        // /ws/typing/:conversationId - Gửi/nhận thông báo đang nhập
        TYPING: {
            path: '/typing/:conversationId',
            description: 'Gửi/nhận thông báo đang nhập',
            pathWithParams: (conversationId) => `/typing/${conversationId}`
        },
        // /ws/presence - Cập nhật và nhận trạng thái hiện diện của người dùng
        PRESENCE: {
            path: '/presence',
            description: 'Cập nhật và nhận trạng thái hiện diện của người dùng'
        }
    },

    // Misc Routes
    MISC: {
        // GET /search - Tìm kiếm tổng hợp (tin nhắn, người dùng, nhóm)
        SEARCH: {
            path: '/search',
            method: 'get',
            description: 'Tìm kiếm tổng hợp (tin nhắn, người dùng, nhóm)'
        },
        // POST /report/user/:id - Báo cáo người dùng
        REPORT_USER: {
            path: '/report/user/:id',
            method: 'post',
            description: 'Báo cáo người dùng',
            pathWithParams: (id) => `/report/user/${id}`
        },
        // POST /report/message/:id - Báo cáo tin nhắn
        REPORT_MESSAGE: {
            path: '/report/message/:id',
            method: 'post',
            description: 'Báo cáo tin nhắn',
            pathWithParams: (id) => `/report/message/${id}`
        },
        // GET /backup - Tạo bản sao lưu dữ liệu
        BACKUP: {
            path: '/backup',
            method: 'get',
            description: 'Tạo bản sao lưu dữ liệu'
        },
        // POST /restore - Khôi phục dữ liệu từ bản sao lưu
        RESTORE: {
            path: '/restore',
            method: 'post',
            description: 'Khôi phục dữ liệu từ bản sao lưu'
        }
    },
};

export default ApiConstant;
