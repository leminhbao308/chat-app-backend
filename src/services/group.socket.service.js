import BaseSocketService from "./base.socket.service.js";
import SocketConstant from "../constants/socket.constant.js";
import repos from "../repos/index.js";
import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";
import GroupConstants from "../constants/group.constants.js";

class GroupSocketService extends BaseSocketService {
    constructor(io) {
        super(io);
    }

    registerSocketEvents(socket, userId) {
        // Group creation
        socket.on(SocketConstant.GROUP.ON_CREATE, async (data) => {
            await this.handleCreateGroup(socket, data, userId);
        });

        // Add member to group
        socket.on(SocketConstant.GROUP.ON_ADD_MEMBER, async (data) => {
            await this.handleAddMemberToGroup(socket, data, userId);
        });

        // Remove member from group
        socket.on(SocketConstant.GROUP.ON_REMOVE_MEMBER, async (data) => {
            await this.handleRemoveMemberFromGroup(socket, data, userId);
        });

        // Change member role
        socket.on(SocketConstant.GROUP.ON_CHANGE_ROLE, async (data) => {
            await this.handleChangeMemberRole(socket, data, userId);
        });

        // Update group settings
        socket.on(SocketConstant.GROUP.ON_UPDATE_SETTINGS, async (data) => {
            await this.handleUpdateGroupSettings(socket, data, userId);
        });

        // Leave group
        socket.on(SocketConstant.GROUP.ON_LEAVE, async (data) => {
            await this.handleLeaveGroup(socket, data, userId);
        });

        // Dissolve group
        socket.on(SocketConstant.GROUP.ON_DISSOLVE, async (data) => {
            await this.handleDissolveGroup(socket, data, userId);
        });

        // Update group info
        socket.on(SocketConstant.GROUP.ON_UPDATE_INFO, async (data) => {
            await this.handleUpdateGroupInfo(socket, data, userId);
        });
    }

    async handleCreateGroup(socket, data, userId) {
        try {
            const { participants, group_name } = data;

            if (!participants || !Array.isArray(participants) || participants.length === 0) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid participant list"
                });
                return;
            }

            // Check if all participants exist
            for (const participantId of participants) {
                const isUserExisted = await repos.auth.isUserExisting(participantId);
                if (!isUserExisted) {
                    socket.emit(SocketConstant.GROUP.ON_ERROR, {
                        error: `User with ID ${participantId} does not exist`
                    });
                    return;
                }
            }

            // Create group conversation
            const conversation = await repos.conversation.createConversationForGroup(
                userId,
                participants,
                group_name || "New Group"
            );

            if (!conversation) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Failed to create group"
                });
                return;
            }

            // Join all participants to the conversation room
            const allParticipants = [...participants, userId];
            for (const participant of allParticipants) {
                const participantSockets = this.getUserSockets(participant);
                if (participantSockets && participantSockets.length > 0) {
                    participantSockets.forEach(s => {
                        s.join(`conversation:${conversation._id}`);
                    });
                }
            }

            // Notify all participants about the new group
            this.io.to(`conversation:${conversation._id}`).emit(
                SocketConstant.GROUP.ON_CREATE_SUCCESS,
                {
                    conversation_id: conversation._id,
                    creator_id: userId,
                    conversation
                }
            );

            // Emit individually to the creator
            socket.emit(SocketConstant.GROUP.ON_CREATE_SUCCESS, {
                conversation_id: conversation._id,
                creator_id: userId,
                conversation
            });

        } catch (error) {
            console.error("Error creating group:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to create group"
            });
        }
    }

    async handleAddMemberToGroup(socket, data, userId) {
        try {
            const { conversation_id, new_participants } = data;

            if (!conversation_id || !new_participants || !Array.isArray(new_participants) || new_participants.length === 0) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            const result = await repos.conversation.addMembersToGroup(conversation_id, userId, new_participants);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to add members or the group doesn't exist"
                });
                return;
            }

            // Add new members to the socket room
            for (const memberId of new_participants) {
                const memberSockets = this.getUserSockets(memberId);
                if (memberSockets && memberSockets.length > 0) {
                    memberSockets.forEach(s => {
                        s.join(`conversation:${conversation_id}`);
                    });
                }
            }

            // Create system message about new members
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) }
            );

            if (conversation) {
                const newMembers = conversation.participants.filter(
                    p => new_participants.includes(p._id.toString())
                );

                const memberNames = newMembers.map(m => m.name || "Unknown").join(", ");

                // Create system message
                const systemMessage = {
                    _id: mongoHelper.generateId(),
                    sender_id: mongoHelper.extractObjectId(userId),
                    content: `${socket.user.first_name || socket.user.name || "User"} added ${memberNames} to the group`,
                    is_system_message: true,
                    reactions: [],
                    metadata: {},
                    deleted_by: [],
                    is_revoked: false,
                    send_timestamp: new Date(),
                    read_by: [
                        {
                            user_id: mongoHelper.extractObjectId(userId),
                            read_at: new Date(),
                        },
                    ],
                };

                // Add system message
                await mongoHelper.updateOne(
                    DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                    { _id: mongoHelper.extractObjectId(conversation_id) },
                    {
                        $push: { messages: systemMessage },
                        $set: {
                            last_message: {
                                content: systemMessage.content,
                                sender_id: mongoHelper.extractObjectId(userId),
                                timestamp: new Date(),
                                is_system_message: true
                            },
                        },
                    }
                );
            }

            // Notify all participants about new members
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_MEMBER_ADDED,
                {
                    conversation_id,
                    added_by: userId,
                    new_members: new_participants,
                    updated_conversation: result
                }
            );

        } catch (error) {
            console.error("Error adding members to group:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to add members to group"
            });
        }
    }

    async handleRemoveMemberFromGroup(socket, data, userId) {
        try {
            const { conversation_id, participant_id } = data;

            if (!conversation_id || !participant_id) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            // Get member info before removal
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) }
            );

            let removedMemberName = "Member";
            if (conversation) {
                const member = conversation.participants.find(
                    p => p._id.toString() === participant_id
                );
                removedMemberName = member?.name || "Member";
            }

            const result = await repos.conversation.removeMemberFromGroup(conversation_id, userId, participant_id);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to remove members or the group doesn't exist"
                });
                return;
            }

            // Remove member from socket room
            const memberSockets = this.getUserSockets(participant_id);
            if (memberSockets && memberSockets.length > 0) {
                memberSockets.forEach(s => {
                    s.leave(`conversation:${conversation_id}`);
                });
            }

            // Create system message
            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content: `${socket.user.first_name || socket.user.name || "User"} removed ${removedMemberName} from the group`,
                is_system_message: true,
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        read_at: new Date(),
                    },
                ],
            };

            // Add system message
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                    },
                }
            );

            // Notify remaining participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_MEMBER_REMOVED,
                {
                    conversation_id,
                    removed_by: userId,
                    removed_member: participant_id,
                    updated_conversation: result
                }
            );

            // Notify the removed user
            memberSockets?.forEach(s => {
                s.emit(SocketConstant.GROUP.ON_YOU_REMOVED, {
                    conversation_id,
                    removed_by: userId
                });
            });

        } catch (error) {
            console.error("Error removing member from group:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to remove member from group"
            });
        }
    }

    async handleChangeMemberRole(socket, data, userId) {
        try {
            const { conversation_id, participant_id, new_role } = data;

            if (!conversation_id || !participant_id || !new_role) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            if (!Object.values(GroupConstants.ROLES).includes(new_role)) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid role specified"
                });
                return;
            }

            // Get member info before role change
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) }
            );

            let memberName = "Member";
            if (conversation) {
                const member = conversation.participants.find(
                    p => p._id.toString() === participant_id
                );
                memberName = member?.name || "Member";
            }

            const result = await repos.conversation.changeMemberRole(conversation_id, userId, participant_id, new_role);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to change roles or the group doesn't exist"
                });
                return;
            }

            // Create system message
            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content: `${socket.user.first_name || socket.user.name || "User"} changed ${memberName}'s role to ${new_role}`,
                is_system_message: true,
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        read_at: new Date(),
                    },
                ],
            };

            // Add system message
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                    },
                }
            );

            // Notify all participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_ROLE_CHANGED,
                {
                    conversation_id,
                    changed_by: userId,
                    member_id: participant_id,
                    new_role,
                    updated_conversation: result
                }
            );

        } catch (error) {
            console.error("Error changing member role:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to change member role"
            });
        }
    }

    async handleUpdateGroupSettings(socket, data, userId) {
        try {
            const { conversation_id, settings } = data;

            if (!conversation_id || !settings || Object.keys(settings).length === 0) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            const result = await repos.conversation.updateGroupSettings(conversation_id, userId, settings);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to update settings or the group doesn't exist"
                });
                return;
            }

            // Create system message
            const settingsUpdated = Object.keys(settings).join(", ");
            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content: `${socket.user.first_name || socket.user.name || "User"} updated group settings: ${settingsUpdated}`,
                is_system_message: true,
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        read_at: new Date(),
                    },
                ],
            };

            // Add system message
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                    },
                }
            );

            // Notify all participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_SETTINGS_UPDATED,
                {
                    conversation_id,
                    updated_by: userId,
                    settings,
                    updated_conversation: result
                }
            );

        } catch (error) {
            console.error("Error updating group settings:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to update group settings"
            });
        }
    }

    async handleLeaveGroup(socket, data, userId) {
        try {
            const { conversation_id } = data;

            if (!conversation_id) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            // Get user info before leaving
            const user = await repos.auth.getUserById(userId);
            const userName = user?.first_name || user?.name || "Member";

            const result = await repos.conversation.leaveGroup(conversation_id, userId);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Cannot leave group or group doesn't exist"
                });
                return;
            }

            // Remove user from socket room
            socket.leave(`conversation:${conversation_id}`);

            // Create system message
            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content: `${userName} left the group`,
                is_system_message: true,
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [],
            };

            // Add system message
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                    },
                }
            );

            // Notify the user who left
            socket.emit(SocketConstant.GROUP.ON_YOU_LEFT, {
                conversation_id
            });

            // Notify remaining participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_MEMBER_LEFT,
                {
                    conversation_id,
                    member_id: userId,
                    updated_conversation: result
                }
            );

        } catch (error) {
            console.error("Error leaving group:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to leave group"
            });
        }
    }

    async handleDissolveGroup(socket, data, userId) {
        try {
            const { conversation_id } = data;

            if (!conversation_id) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            // Get conversation info before dissolving
            const conversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) }
            );

            if (!conversation) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Group doesn't exist"
                });
                return;
            }

            const result = await repos.conversation.dissolveGroup(conversation_id, userId);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to dissolve this group"
                });
                return;
            }

            // Create system message
            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content: `Group "${conversation.group_name || 'Unnamed group'}" has been dissolved by ${socket.user.first_name || socket.user.name || "Admin"}`,
                is_system_message: true,
                reactions: [],
                metadata: { group_dissolved: true },
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        read_at: new Date(),
                    },
                ],
            };

            // Add system message and mark as dissolved
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                        is_dissolved: true,
                        dissolved_at: new Date(),
                        dissolved_by: mongoHelper.extractObjectId(userId)
                    },
                }
            );

            // Notify all participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_DISSOLVED,
                {
                    conversation_id,
                    dissolved_by: userId
                }
            );

            // Clear the room
            this.io.in(`conversation:${conversation_id}`).socketsLeave(`conversation:${conversation_id}`);

        } catch (error) {
            console.error("Error dissolving group:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to dissolve group"
            });
        }
    }

    async handleUpdateGroupInfo(socket, data, userId) {
        try {
            const { conversation_id, group_name, group_avatar } = data;

            if (!conversation_id || (!group_name && !group_avatar)) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "Invalid request data"
                });
                return;
            }

            const updateData = {};
            if (group_name) updateData.group_name = group_name;
            if (group_avatar) updateData.group_avatar = group_avatar;

            const result = await repos.conversation.updateConversationInfo(conversation_id, userId, updateData);

            if (!result) {
                socket.emit(SocketConstant.GROUP.ON_ERROR, {
                    error: "You don't have permission to update group info or the group doesn't exist"
                });
                return;
            }

            // Create system message
            let content = "";
            if (group_name && group_avatar) {
                content = `${socket.user.first_name || socket.user.name || "User"} updated group name and avatar`;
            } else if (group_name) {
                content = `${socket.user.first_name || socket.user.name || "User"} changed group name to "${group_name}"`;
            } else if (group_avatar) {
                content = `${socket.user.first_name || socket.user.name || "User"} updated group avatar`;
            }

            const systemMessage = {
                _id: mongoHelper.generateId(),
                sender_id: mongoHelper.extractObjectId(userId),
                content,
                is_system_message: true,
                reactions: [],
                metadata: {},
                deleted_by: [],
                is_revoked: false,
                send_timestamp: new Date(),
                read_by: [
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        read_at: new Date(),
                    },
                ],
            };

            // Add system message
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                { _id: mongoHelper.extractObjectId(conversation_id) },
                {
                    $push: { messages: systemMessage },
                    $set: {
                        last_message: {
                            content: systemMessage.content,
                            sender_id: mongoHelper.extractObjectId(userId),
                            timestamp: new Date(),
                            is_system_message: true
                        },
                    },
                }
            );

            // Notify all participants
            this.io.to(`conversation:${conversation_id}`).emit(
                SocketConstant.GROUP.ON_INFO_UPDATED,
                {
                    conversation_id,
                    updated_by: userId,
                    updates: updateData,
                    updated_conversation: result
                }
            );

        } catch (error) {
            console.error("Error updating group info:", error);
            socket.emit(SocketConstant.GROUP.ON_ERROR, {
                error: "Failed to update group info"
            });
        }
    }
}

export default GroupSocketService;
