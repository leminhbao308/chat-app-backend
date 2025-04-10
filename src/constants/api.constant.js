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
        // POST /verify-phone - Xác thực số điện thoại
        VERIFY: {
            path: '/verify-phone',
            method: 'post',
            description: 'Xác thực số điện thoại'
        },
        // POST /change-password - Yêu cầu thay đổi mật khẩu
        CHANGE_PASSWORD: {
            path: '/change-password/user_id',
            method: 'post',
            description: 'Yêu cầu thay đổi mật khẩu'
        },
        // ✅ Gửi mã OTP yêu cầu đặt lại mật khẩu
        // FORGOT_PASSWORD: {
        //     path: '/forgot-password',
        //     method: 'post',
        //     description: 'Yêu cầu đặt lại mật khẩu'
        // },
        FORGOT_PASSWORD: {
            path: '/reset-password/request',
            method: 'post',
            description: 'Yêu cầu gửi mã OTP đặt lại mật khẩu'
        },

        // ✅ Xác thực mã OTP và đặt lại mật khẩu
        // RESET_PASSWORD: {
        //     path: '/reset-password',
        //     method: 'post',
        //     description: 'Đặt lại mật khẩu'
        // },
        RESET_PASSWORD: {
            path: '/reset-password/confirm',
            method: 'put',
            description: 'Xác thực mã OTP và đặt lại mật khẩu'
        },
        // POST /verify-reset-code
        VERIFY_RESET_CODE: {
            path: '/verify-reset-code',
            method: 'post',
            description: 'Mã đặt lại mật khẩu'
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
        // PUT /profile-picture - Cập nhật ảnh đại diện
        PROFILE_PICTURE: {
            path: '/profile-picture',
            method: 'put',
            description: 'Cập nhật ảnh đại diện'
        }
    },

    // Contacts/Friends Routes
    CONTACTS: {
        // GET /contacts - Lấy danh sách liên hệ/bạn bè
        LIST: {
            path: '/contacts',
            method: 'get',
            description: 'Lấy danh sách liên hệ/bạn bè'
        },
        // POST /contacts/add/:userId - Gửi lời mời kết bạn
        ADD: {
            path: '/contacts/add/:userId',
            method: 'post',
            description: 'Gửi lời mời kết bạn',
            pathWithParams: (userId) => `/contacts/add/${userId}`
        },
        // GET /contacts/requests - Lấy danh sách lời mời kết bạn
        REQUESTS: {
            path: '/contacts/requests',
            method: 'get',
            description: 'Lấy danh sách lời mời kết bạn'
        },
        // PUT /contacts/accept/:requestId - Chấp nhận lời mời kết bạn
        ACCEPT: {
            path: '/contacts/accept/:requestId',
            method: 'put',
            description: 'Chấp nhận lời mời kết bạn',
            pathWithParams: (requestId) => `/contacts/accept/${requestId}`
        },
        // PUT /contacts/reject/:requestId - Từ chối lời mời kết bạn
        REJECT: {
            path: '/contacts/reject/:requestId',
            method: 'put',
            description: 'Từ chối lời mời kết bạn',
            pathWithParams: (requestId) => `/contacts/reject/${requestId}`
        },
        // DELETE /contacts/:userId - Xóa liên hệ/bạn bè
        REMOVE: {
            path: '/contacts/:userId',
            method: 'delete',
            description: 'Xóa liên hệ/bạn bè',
            pathWithParams: (userId) => `/contacts/${userId}`
        },
        // PUT /contacts/:userId/block - Chặn người dùng
        BLOCK: {
            path: '/contacts/:userId/block',
            method: 'put',
            description: 'Chặn người dùng',
            pathWithParams: (userId) => `/contacts/${userId}/block`
        },
        // PUT /contacts/:userId/unblock - Bỏ chặn người dùng
        UNBLOCK: {
            path: '/contacts/:userId/unblock',
            method: 'put',
            description: 'Bỏ chặn người dùng',
            pathWithParams: (userId) => `/contacts/${userId}/unblock`
        },
        // GET /contacts/blocked - Lấy danh sách người dùng bị chặn
        BLOCKED: {
            path: '/contacts/blocked',
            method: 'get',
            description: 'Lấy danh sách người dùng bị chặn'
        }
    },

    // Conversation Routes
    CONVERSATIONS: {
        // GET /conversations - Lấy tất cả cuộc trò chuyện của người dùng
        LIST: {
            path: '/conversations',
            method: 'get',
            description: 'Lấy tất cả cuộc trò chuyện của người dùng'
        },
        // POST /conversations - Tạo cuộc trò chuyện mới
        CREATE: {
            path: '/conversations',
            method: 'post',
            description: 'Tạo cuộc trò chuyện mới'
        },
        // GET /conversations/:id - Lấy thông tin chi tiết về cuộc trò chuyện
        DETAIL: {
            path: '/conversations/:id',
            method: 'get',
            description: 'Lấy thông tin chi tiết về cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}`
        },
        // PUT /conversations/:id - Cập nhật thông tin cuộc trò chuyện
        UPDATE: {
            path: '/conversations/:id',
            method: 'put',
            description: 'Cập nhật thông tin cuộc trò chuyện (tên, ảnh)',
            pathWithParams: (id) => `/conversations/${id}`
        },
        // PUT /conversations/:id/archive - Lưu trữ cuộc trò chuyện
        ARCHIVE: {
            path: '/conversations/:id/archive',
            method: 'put',
            description: 'Lưu trữ cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/archive`
        },
        // PUT /conversations/:id/unarchive - Bỏ lưu trữ cuộc trò chuyện
        UNARCHIVE: {
            path: '/conversations/:id/unarchive',
            method: 'put',
            description: 'Bỏ lưu trữ cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unarchive`
        },
        // PUT /conversations/:id/pin - Ghim cuộc trò chuyện
        PIN: {
            path: '/conversations/:id/pin',
            method: 'put',
            description: 'Ghim cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/pin`
        },
        // PUT /conversations/:id/unpin - Bỏ ghim cuộc trò chuyện
        UNPIN: {
            path: '/conversations/:id/unpin',
            method: 'put',
            description: 'Bỏ ghim cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unpin`
        },
        // PUT /conversations/:id/mute - Tắt thông báo cuộc trò chuyện
        MUTE: {
            path: '/conversations/:id/mute',
            method: 'put',
            description: 'Tắt thông báo cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/mute`
        },
        // PUT /conversations/:id/unmute - Bật thông báo cuộc trò chuyện
        UNMUTE: {
            path: '/conversations/:id/unmute',
            method: 'put',
            description: 'Bật thông báo cuộc trò chuyện',
            pathWithParams: (id) => `/conversations/${id}/unmute`
        }
    },

    // Message Routes
    MESSAGES: {
        // GET /conversations/:conversationId/messages - Lấy tin nhắn trong cuộc trò chuyện
        LIST: {
            path: '/conversations/:conversationId/messages',
            method: 'get',
            description: 'Lấy tin nhắn trong cuộc trò chuyện (phân trang)',
            pathWithParams: (conversationId) => `/conversations/${conversationId}/messages`
        },
        // POST /conversations/:conversationId/messages - Gửi tin nhắn mới
        SEND: {
            path: '/conversations/:conversationId/messages',
            method: 'post',
            description: 'Gửi tin nhắn mới',
            pathWithParams: (conversationId) => `/conversations/${conversationId}/messages`
        },
        // PUT /conversations/:conversationId/messages/:messageId - Cập nhật/sửa tin nhắn
        UPDATE: {
            path: '/conversations/:conversationId/messages/:messageId',
            method: 'put',
            description: 'Cập nhật/sửa tin nhắn',
            pathWithParams: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}`
        },
        // DELETE /conversations/:conversationId/messages/:messageId - Xóa tin nhắn
        DELETE: {
            path: '/conversations/:conversationId/messages/:messageId',
            method: 'delete',
            description: 'Xóa tin nhắn',
            pathWithParams: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}`
        },
        // POST /conversations/:conversationId/messages/:messageId/react - Thêm biểu cảm vào tin nhắn
        REACT: {
            path: '/conversations/:conversationId/messages/:messageId/react',
            method: 'post',
            description: 'Thêm biểu cảm vào tin nhắn',
            pathWithParams: (conversationId, messageId) => `/conversations/${conversationId}/messages/${messageId}/react`
        },
        // DELETE /conversations/:conversationId/messages/:messageId/react/:reactionId - Xóa biểu cảm
        REMOVE_REACT: {
            path: '/conversations/:conversationId/messages/:messageId/react/:reactionId',
            method: 'delete',
            description: 'Xóa biểu cảm khỏi tin nhắn',
            pathWithParams: (conversationId, messageId, reactionId) =>
                `/conversations/${conversationId}/messages/${messageId}/react/${reactionId}`
        },
        // GET /conversations/:conversationId/messages/:messageId/read-receipts - Lấy trạng thái đã đọc
        READ_RECEIPTS: {
            path: '/conversations/:conversationId/messages/:messageId/read-receipts',
            method: 'get',
            description: 'Lấy trạng thái đã đọc của tin nhắn',
            pathWithParams: (conversationId, messageId) =>
                `/conversations/${conversationId}/messages/${messageId}/read-receipts`
        },
        // POST /conversations/:conversationId/read - Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
        MARK_READ: {
            path: '/conversations/:conversationId/read',
            method: 'post',
            description: 'Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện',
            pathWithParams: (conversationId) => `/conversations/${conversationId}/read`
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
        // /ws/connect - Kết nối WebSocket
        CONNECT: {
            path: '/ws/connect',
            description: 'Kết nối WebSocket'
        },
        // /ws/typing/:conversationId - Gửi/nhận thông báo đang nhập
        TYPING: {
            path: '/ws/typing/:conversationId',
            description: 'Gửi/nhận thông báo đang nhập',
            pathWithParams: (conversationId) => `/ws/typing/${conversationId}`
        },
        // /ws/presence - Cập nhật và nhận trạng thái hiện diện của người dùng
        PRESENCE: {
            path: '/ws/presence',
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
    }
};

export default ApiConstant;
