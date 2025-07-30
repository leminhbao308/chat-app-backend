const SocketConstant = {
    CONNECT: "connection",
    DISCONNECT: "disconnect",

    PROFILE: {
        ON_INFO_UPDATED: "on user info updated",
        EMIT_INFO_UPDATED: "emit user info updated",
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
    ON_MESSAGE_DELETE: 'delete message',
    ON_MESSAGE_REVOKE: 'revoke message',
    ON_MARK_MESSAGES_READ: "mark messages read",

    PRESENCE: {
        ON_ONLINE: "online users",
    },

    CONVERSATION: {
        ON_NEW_MESSAGE: "new message",
        ON_UNREAD_MESSAGE: "unread messages",
        ON_NEW_NOTIFICATION: "message notification",
    },

    GROUP: {
        // Group creation
        ON_CREATE: "create group",
        ON_CREATE_SUCCESS: "group created",

        // Group member management
        ON_ADD_MEMBER: "add member",
        ON_MEMBER_ADDED: "member added",
        ON_REMOVE_MEMBER: "remove member",
        ON_MEMBER_REMOVED: "member removed",
        ON_YOU_REMOVED: "you were removed",

        // Group role management
        ON_CHANGE_ROLE: "change role",
        ON_ROLE_CHANGED: "role changed",

        // Group settings
        ON_UPDATE_SETTINGS: "update settings",
        ON_SETTINGS_UPDATED: "settings updated",

        // Group exit
        ON_LEAVE: "leave group",
        ON_MEMBER_LEFT: "member left",
        ON_YOU_LEFT: "you left",

        // Group dissolution
        ON_DISSOLVE: "dissolve group",
        ON_DISSOLVED: "group dissolved",

        // Group info updates
        ON_UPDATE_INFO: "update group info",
        ON_INFO_UPDATED: "group info updated",

        // Error handling
        ON_ERROR: "group error"
    },

    MESSAGE: {
        // message send events
        ON_SEND: "send message",
        ON_ERROR: "message error",


        // message delete events
        ON_DELETE: 'delete message',
        ON_DELETE_SUCCESS: "message deleted",
        ON_DELETE_ERROR: "message delete error",

        // message revoke events
        ON_REVOKE: 'revoke message',
        ON_REVOKE_SUCCESS: "message revoked",
        ON_REVOKE_ERROR: "message revoke error",

        // other message events
        ON_MARK_AS_READ: "mark messages read",
        ON_READ_SUCCESS: "messages read",
        ON_READ_ERROR: "read status error",

    },

    TYPING: {
        ON_START: "typing",
        ON_STOP: "stop typing",
        EMIT_STAR: "user typing",
        EMIT_STOP: "user stop typing",
    },
}

export default SocketConstant
