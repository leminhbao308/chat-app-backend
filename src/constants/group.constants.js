const GroupConstants = {
    ROLES: {
        ADMIN: "admin",
        CO_ADMIN: "co-admin",
        MEMBER: "member"
    },
    SETTINGS: {
        WHO_CAN_UPDATE_GROUP_INFO: ["admin"],
        WHO_CAN_ADD_MEMBER: ["admin", "co-admin"],
        WHO_CAN_REMOVE_MEMBER: ["admin", "co-admin"],
        WHO_CAN_ASSIGN_PERMS: ["admin"]
    }
}

export default GroupConstants
