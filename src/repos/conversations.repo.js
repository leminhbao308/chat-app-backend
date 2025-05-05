import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";
import repos from "./index.js";
import ValidationConstant from "../constants/validation.constant.js";
import "dotenv/config";
import GroupConstants from "../constants/group.constants.js";

const ConversationsRepo = {
    async getConversationsForUser(userId) {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const conversations = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {"participants._id": id}
            )

            return conversations || []
        } catch (err) {
            console.error("Error getting conversations: ", err)
            return []
        }
    },

    async createConversationForContacts(userId1, userId2) {
        try {
            // Kiểm tra xem conversation đã tồn tại chưa
            const existingConversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    $and: [
                        {"participants._id": mongoHelper.extractObjectId(userId1)},
                        {"participants._id": mongoHelper.extractObjectId(userId2)},
                        {"participants": {$size: 2}}
                    ]
                }
            );

            if (existingConversation) {
                return existingConversation;
            }

            // Thông tin 2 user
            const user1 = await repos.auth.getUserById(userId1);
            const user2 = await repos.auth.getUserById(userId2);

            // Tạo conversation mới
            const newConversation = {
                name: "",
                conversation_url: process.env.DEFAULT_GROUP_THUMBNAIL_URL,
                type: ValidationConstant.CONVERSATION_TYPE.PRIVATE,
                participants: [
                    {
                        _id: user1._id,
                        first_name: user1.first_name,
                        last_name: user1.last_name,
                        avatar_url: user1.avatar_url
                    },
                    {
                        _id: user2._id,
                        first_name: user2.first_name,
                        last_name: user2.last_name,
                        avatar_url: user2.avatar_url
                    }
                ],
                created_at: new Date(),
                updated_at: new Date(),
                messages: [],
                pin_messages: [],
                files: []
            };

            return await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                newConversation
            );
        } catch (error) {
            console.error("Error creating conversation for contacts:", error);
            return null
        }
    },

    async createConversationForGroup(adminId, userIds, groupName = "New Group") {
        try {
            // Validate userIds is an array with at least 2 members
            if (!Array.isArray(userIds) || userIds.length < 2) {
                return null;
            }

            // Get all users' information
            const participants = [];

            const admin = await repos.auth.getUserById(adminId);
            if (admin) {
                participants.push({
                    _id: admin._id,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    avatar_url: admin.avatar_url,
                    role: GroupConstants.ROLES.ADMIN,
                });
            }

            for (const userId of userIds) {
                const user = await repos.auth.getUserById(userId);
                if (user) {
                    participants.push({
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        avatar_url: user.avatar_url,
                        role: GroupConstants.ROLES.MEMBER
                    });
                }
            }

            const settingsDefault = GroupConstants.SETTINGS

            // Create new group conversation
            const newConversation = {
                name: groupName,
                conversation_url: process.env.DEFAULT_GROUP_THUMBNAIL_URL,
                type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                participants: participants,
                created_at: new Date(),
                updated_at: new Date(),
                messages: [],
                pin_messages: [],
                files: [],
                settings: settingsDefault
            };

            return await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                newConversation
            );
        } catch (error) {
            console.error("Error creating conversation for group:", error);
            return null;
        }
    },

    async isUserParticipateInConversation(conversationId, userId) {
        try {
            const result = await mongoHelper.count(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    "participants._id": mongoHelper.extractObjectId(userId)
                }
            );

            return result > 0;
        } catch (error) {
            console.error("Error checking user is participating in conversation: ", error);
            return false;
        }
    },
    async updateConversationInfo(conversationId, userId, data) {
        try {
            // Find the conversation where the user is a participant
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    'participants._id': mongoHelper.extractObjectId(userId)
                }
            );

            if (!conversation) {
                console.warn("Conversation not found or user not a participant");
                return null;
            }

            // Find the user's role in this conversation
            const userParticipant = conversation.participants.find(
                p => p._id.toString() === userId.toString()
            );

            if (!userParticipant) {
                console.warn("User not found in conversation participants");
                return null;
            }

            const userRole = userParticipant.role;

            // Check if user has permission to update group info
            if (conversation.type === ValidationConstant.CONVERSATION_TYPE.GROUP) {
                const whoCanUpdate = conversation.settings?.WHO_CAN_UPDATE_GROUP_INFO || GroupConstants.SETTINGS.WHO_CAN_UPDATE_GROUP_INFO;

                if (!whoCanUpdate.includes(userRole)) {
                    console.warn("User doesn't have permission to update group info");
                    return null;
                }
            }

            // Prepare update fields
            const updateFields = {};
            updateFields.updated_at = new Date();

            // For group conversations
            if (conversation.type === ValidationConstant.CONVERSATION_TYPE.GROUP) {
                if (data.name) updateFields.name = data.name;
                if (data.conversation_url) updateFields.conversation_url = data.conversation_url;

                // Update settings if provided
                if (data.settings) {
                    // Only admin can modify settings
                    if (userRole === GroupConstants.ROLES.ADMIN) {
                        updateFields.settings = {
                            ...conversation.settings,
                            ...data.settings
                        };
                    }
                }
            }

            // If no fields to update, return null
            if (Object.keys(updateFields).length <= 0) {
                console.warn("No fields to update");
                return null;
            }

            // Update the conversation
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {$set: updateFields}
            );

            // Check if update was successful
            if (result && result.modifiedCount > 0) {
                // Return the updated conversation
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error updating conversation:", error);
            return null;
        }
    },

    // conversationRepo.js

// Add members to group
    async addMembersToGroup(conversationId, adminId, userIds) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(adminId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Check if user has permission to add members
            const adminParticipant = conversation.participants.find(
                p => p._id.toString() === adminId.toString()
            );

            if (!adminParticipant) {
                console.warn("Admin not found in participants");
                return null;
            }

            const adminRole = adminParticipant.role;
            const whoCanAdd = conversation.settings?.WHO_CAN_ADD_MEMBER ||
                GroupConstants.SETTINGS.WHO_CAN_ADD_MEMBER;

            if (!whoCanAdd.includes(adminRole)) {
                console.warn("User doesn't have permission to add members");
                return null;
            }

            // Get all existing participant IDs to avoid duplicates
            const existingParticipantIds = conversation.participants.map(p => p._id.toString());
            const newMembers = [];

            // Process each user ID to add
            for (const userId of userIds) {
                // Skip users who are already participants
                if (existingParticipantIds.includes(userId.toString())) {
                    continue;
                }

                const user = await repos.auth.getUserById(userId);
                if (user) {
                    newMembers.push({
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        avatar_url: user.avatar_url,
                        role: GroupConstants.ROLES.MEMBER
                    });
                }
            }

            // If no valid new members, return null
            if (newMembers.length === 0) {
                console.warn("No valid new members to add");
                return null;
            }

            // Add new members to the group
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $push: {participants: {$each: newMembers}},
                    $set: {updated_at: new Date()}
                }
            );

            // Return updated conversation if successful
            if (result && result.modifiedCount > 0) {
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error adding members to group:", error);
            return null;
        }
    },

// Remove member from group
    async removeMemberFromGroup(conversationId, adminId, memberId) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(adminId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Check if user has permission to remove members
            const adminParticipant = conversation.participants.find(
                p => p._id.toString() === adminId.toString()
            );

            if (!adminParticipant) {
                console.warn("Admin not found in participants");
                return null;
            }

            const adminRole = adminParticipant.role;
            const whoCanRemove = conversation.settings?.WHO_CAN_REMOVE_MEMBER ||
                GroupConstants.SETTINGS.WHO_CAN_REMOVE_MEMBER;

            if (!whoCanRemove.includes(adminRole)) {
                console.warn("User doesn't have permission to remove members");
                return null;
            }

            // Check if target member exists
            const targetMember = conversation.participants.find(
                p => p._id.toString() === memberId.toString()
            );

            if (!targetMember) {
                console.warn("Target member not found in group");
                return null;
            }

            // Cannot remove admin unless you're the admin
            if (targetMember.role === GroupConstants.ROLES.ADMIN && adminRole !== GroupConstants.ROLES.ADMIN) {
                console.warn("Cannot remove admin unless you are the admin");
                return null;
            }

            // Remove the member
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $pull: {participants: {_id: mongoHelper.extractObjectId(memberId)}},
                    $set: {updated_at: new Date()}
                }
            );

            // Return updated conversation if successful
            if (result && result.modifiedCount > 0) {
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error removing member from group:", error);
            return null;
        }
    },

// Change member role
    async changeMemberRole(conversationId, adminId, memberId, newRole) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(adminId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Check if user has permission to assign permissions
            const adminParticipant = conversation.participants.find(
                p => p._id.toString() === adminId.toString()
            );

            if (!adminParticipant) {
                console.warn("Admin not found in participants");
                return null;
            }

            const adminRole = adminParticipant.role;
            const whoCanAssign = conversation.settings?.WHO_CAN_ASSIGN_PERMS ||
                GroupConstants.SETTINGS.WHO_CAN_ASSIGN_PERMS;

            if (!whoCanAssign.includes(adminRole)) {
                console.warn("User doesn't have permission to assign roles");
                return null;
            }

            // Find the target member in participants
            const targetMemberIndex = conversation.participants.findIndex(
                p => p._id.toString() === memberId.toString()
            );

            if (targetMemberIndex === -1) {
                console.warn("Target member not found in group");
                return null;
            }

            // Cannot change admin role unless you're the admin
            if (conversation.participants[targetMemberIndex].role === GroupConstants.ROLES.ADMIN &&
                adminRole !== GroupConstants.ROLES.ADMIN) {
                console.warn("Cannot change admin role unless you are the admin");
                return null;
            }

            // Update member role
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $set: {
                        [`participants.${targetMemberIndex}.role`]: newRole,
                        updated_at: new Date()
                    }
                }
            );

            // Return updated conversation if successful
            if (result && result.modifiedCount > 0) {
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error changing member role:", error);
            return null;
        }
    },

// Update group settings
    async updateGroupSettings(conversationId, adminId, newSettings) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(adminId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Only admin can update settings
            const adminParticipant = conversation.participants.find(
                p => p._id.toString() === adminId.toString()
            );

            if (!adminParticipant || adminParticipant.role !== GroupConstants.ROLES.ADMIN) {
                console.warn("Only admin can update group settings");
                return null;
            }

            // Merge existing settings with new settings
            const updatedSettings = {
                ...conversation.settings || GroupConstants.SETTINGS,
                ...newSettings
            };

            // Update settings
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $set: {
                        settings: updatedSettings,
                        updated_at: new Date()
                    }
                }
            );

            // Return updated conversation if successful
            if (result && result.modifiedCount > 0) {
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error updating group settings:", error);
            return null;
        }
    },

// Leave group
    async leaveGroup(conversationId, userId) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(userId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Find the user in participants
            const userParticipant = conversation.participants.find(
                p => p._id.toString() === userId.toString()
            );

            if (!userParticipant) {
                console.warn("User not found in participants");
                return null;
            }

            // If user is the admin and there are other participants
            if (userParticipant.role === GroupConstants.ROLES.ADMIN && conversation.participants.length > 1) {
                // Find another participant to promote to admin
                const newAdminIndex = conversation.participants.findIndex(
                    p => p._id.toString() !== userId.toString() && p.role === GroupConstants.ROLES.CO_ADMIN
                );

                // If no co-admin found, find the first non-admin participant
                const firstMemberIndex = newAdminIndex === -1 ?
                    conversation.participants.findIndex(p => p._id.toString() !== userId.toString()) : newAdminIndex;

                if (firstMemberIndex !== -1) {
                    // Promote this member to admin
                    await mongoHelper.updateOne(
                        DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                        {_id: mongoHelper.extractObjectId(conversationId)},
                        {
                            $set: {
                                [`participants.${firstMemberIndex}.role`]: GroupConstants.ROLES.ADMIN
                            }
                        }
                    );
                }
            } else if (userParticipant.role === GroupConstants.ROLES.ADMIN && conversation.participants.length === 1) {
                // If user is the only admin and the only participant, dissolve the group
                return await this.dissolveGroup(conversationId, userId);
            }

            // Remove the user from participants
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $pull: {participants: {_id: mongoHelper.extractObjectId(userId)}},
                    $set: {updated_at: new Date()}
                }
            );

            // Return updated conversation if successful
            if (result && result.modifiedCount > 0) {
                return await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    {_id: mongoHelper.extractObjectId(conversationId)}
                );
            }

            return null;
        } catch (error) {
            console.error("Error leaving group:", error);
            return null;
        }
    },

// Dissolve group
    async dissolveGroup(conversationId, adminId) {
        try {
            // Find the conversation
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    type: ValidationConstant.CONVERSATION_TYPE.GROUP,
                    'participants._id': mongoHelper.extractObjectId(adminId)
                }
            );

            if (!conversation) {
                console.warn("Group not found or user not a participant");
                return null;
            }

            // Check if user is admin
            const adminParticipant = conversation.participants.find(
                p => p._id.toString() === adminId.toString()
            );

            if (!adminParticipant || adminParticipant.role !== GroupConstants.ROLES.ADMIN) {
                console.warn("Only admin can dissolve the group");
                return null;
            }

            // Archive the group instead of deleting it
            // This allows for data recovery if needed
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {_id: mongoHelper.extractObjectId(conversationId)},
                {
                    $set: {
                        status: "dissolved",
                        dissolved_at: new Date(),
                        dissolved_by: mongoHelper.extractObjectId(adminId),
                        updated_at: new Date()
                    }
                }
            );

            // Return result if successful
            if (result && result.modifiedCount > 0) {
                return {
                    success: true,
                    conversationId: conversationId
                };
            }

            return null;
        } catch (error) {
            console.error("Error dissolving group:", error);
            return null;
        }
    }
}

export default ConversationsRepo
