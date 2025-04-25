/**
 * Các hằng số liên quan đến validation
 */
const ValidationConstant = {
    REGEX: {
        DATE: /^\d{2}-\d{2}-\d{4}$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        PHONE: /^(\+84|84|0)([357892])[0-9]{8,9}$/,
        SIX_DIGIT_CODE: /^\d{6}$/
    },

    AUDIT: {
        CREATED: "created_at",
        UPDATED: "updated_at"
    },

    SORT: {
        ASC: "asc",
        DESC: "desc"
    },

    CONTACT_STATUS: {
        PENDING: "pending",
        ACCEPTED: "accepted",
        BLOCKED: "blocked"
    },

    DEVICE_TYPE: {
      MOB: "mobile",
      WEB: "web"
    },

    USER_ATT: {
        FIRST_NAME: "first_name",
        LAST_NAME: "last_name",
        LAST_LOGIN: "last_login"
    },

    CONVERSATION_ATT: {
        NAME: "name",
        TYPE: "type"
    },
    CONVERSATION_TYPE: {
        TYPE: "type",
        GROUP: "group",
        PRIVATE: "private"
    },

    GROUP_ROLE: {
        ADMIN: "admin",
        CO_ADMIN: "co-admin",
        MEM: "member"
    },

    CONTACT_NICKNAME: "nickname",
    CONTACT_LAST_INTERACTION: "last_interaction",

    MEDIA_SIZE: "size",
    MEDIA_NAME: "filename",

    MEDIA_TYPE: {
        TXT: "text",
        IMG: "image",
        VID: "video",
        FILE: "file",
        AUD: "audio",
        DOC: "document"
    },

    GENDER: {
        M: "male",
        F: "female"
    }
}

export default ValidationConstant;
