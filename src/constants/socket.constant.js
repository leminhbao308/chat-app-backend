const SocketConstant = {
    CONNECT: "connection",
    DISCONNECT: "disconnect",

    PROFILE: {
        ON_INFO_UPDATED: "user info updated",
        ON_AVATAR_UPDATED: "avatar updated"
    },

    CONTACT: {
        ON_REQUEST_SENT: "contact request sent",
        ON_REQUEST_ACCEPTED: "contact request accepted",
        EMIT_NEW_CONTACT_REQUEST: "new contact request",
        EMIT_NEW_CONTACT_ACCEPTED: "contact request accepted"
    },

    REQUEST_ONLINE_USER: "request online users",
    ON_JOIN_CONVERSATION: "join conversation",
    ON_LEAVE_CONVERSATION: "leave conversation",
    ON_MESSAGE_SEND: "send message",
    ON_MARK_MESSAGES_READ: "mark messages read",
    ON_TYPING: "typing",
    ON_STOP_TYPING: "stop typing",
}

export default SocketConstant
