import mongoHelper from "../helper/mongo.helper.js";
import ContactConstant from "../constants/contact.constant.js";
import DatabaseConstant from "../constants/database.constant.js";

const ContactRepo = {
    async createContactRequest(userId, contactId) {
        try {
            // Kiểm tra xem đã có yêu cầu kết bạn từ người kia chưa
            const existingRequest = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    'members': {
                        $all: [
                            mongoHelper.extractObjectId(userId),
                            mongoHelper.extractObjectId(contactId)
                        ],
                        $size: 2
                    }
                }
            );

            if (existingRequest) {
                // Nếu đã có yêu cầu từ người kia, chấp nhận luôn
                if (existingRequest.status === ContactConstant.STATUS.PENDING) {
                    await this.acceptContactRequest(contactId, userId);
                    return {isAccepted: true};
                }
                return {isAccepted: false, existingRequest};
            }

            // Nếu chưa có yêu cầu nào, tạo mới
            const newContact = {
                members: [
                    mongoHelper.extractObjectId(userId),
                    mongoHelper.extractObjectId(contactId)
                ],
                requester: mongoHelper.extractObjectId(userId),
                status: ContactConstant.STATUS.PENDING,
            };

            const result = await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                newContact
            );

            return {isAccepted: false, newRequest: result};
        } catch (error) {
            console.error("Error creating contact request:", error);
            throw error;
        }
    },

    async acceptContactRequest(requestId) {
        try {
            // Cập nhật trạng thái request thành 'accepted'
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {_id: mongoHelper.extractObjectId(requestId)},
                {
                    $set: {
                        status: ContactConstant.STATUS.ACCEPTED
                    }
                }
            );

            return true;
        } catch (error) {
            console.error("Error accepting contact request:", error);
            throw error;
        }
    },

    async rejectContactRequest(requestId) {
        try {
            // Xóa request
            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {_id: mongoHelper.extractObjectId(requestId)}
            );

            return true;
        } catch (error) {
            console.error("Error rejecting contact request:", error);
            throw error;
        }
    },

    async cancelContactRequest(requestId) {
        try {
            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {_id: mongoHelper.extractObjectId(requestId)}
            );
        } catch (error) {
            console.error("Error canceling contact request:", error);
            throw error;
        }
    },

    async getContactList(userId) {
        try {
            const objectId = mongoHelper.extractObjectId(userId);

            // Find all accepted contacts where the user is a member
            const contacts = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    members: objectId,
                    status: "accepted"
                }
            );

            // Populate contact details for each contact
            const populatedContacts = [];
            for (const contact of contacts) {
                // Find the contact's ID (the other member in the array)
                const contactId = contact.members.find(member =>
                    !member.equals(objectId)
                );

                // Get contact user details
                const contactDetails = await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.USERS,
                    { _id: contactId },
                    {
                        username: 1,
                        avatar_url: 1,
                        phone_number: 1
                    }
                );

                populatedContacts.push({
                    _id: contact._id,
                    contact_id: contactId,
                    status: contact.status,
                    requester: contact.requester,
                    created_at: contact.created_at,
                    updated_at: contact.updated_at,
                    contact_details: contactDetails
                });
            }

            return populatedContacts;
        } catch (error) {
            console.error("Error getting contact list:", error);
            throw error;
        }
    },

    async getPendingRequest(requestSender, requestReceiver) {
        try {
            return await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    'members': {
                        $all: [
                            mongoHelper.extractObjectId(requestSender),
                            mongoHelper.extractObjectId(requestReceiver)
                        ],
                        $size: 2
                    },
                    requester: mongoHelper.extractObjectId(requestSender),
                    status: ContactConstant.STATUS.PENDING
                }
            );
        } catch (error) {
            console.error("Error getting pending request: ", error);
            throw error;
        }
    },

    async getPendingRequests(userId) {
        try {
            const objectId = mongoHelper.extractObjectId(userId);

            // Get all pending requests where the user is the receiver
            const pendingRequests = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    members: objectId,
                    requester: { $ne: objectId }, // User is not the requester
                    status: ContactConstant.STATUS.PENDING
                }
            );

            // Get requester details for each request
            const populatedRequests = [];
            for (const request of pendingRequests) {
                const requesterDetails = await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.USERS,
                    { _id: request.requester },
                    {
                        username: 1,
                        avatar_url: 1,
                        phone_number: 1
                    }
                );

                populatedRequests.push({
                    ...request,
                    requester_details: requesterDetails
                });
            }

            return populatedRequests;
        } catch (error) {
            console.error("Error getting all pending requests:", error);
            throw error;
        }
    },

    async getSentRequests(userId) {
        try {
            const objectId = mongoHelper.extractObjectId(userId);

            // Find all pending contacts where the user is the requester
            const sentRequests = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    requester: objectId,
                    status: ContactConstant.STATUS.PENDING
                }
            );

            // Populate receiver details for each request
            const populatedRequests = [];
            for (const request of sentRequests) {
                // Find the receiver's ID (the member that isn't the requester)
                const receiverId = request.members.find(member =>
                    !member.equals(objectId)
                );

                // Get receiver user details
                const receiverDetails = await mongoHelper.findOne(
                    DatabaseConstant.COLLECTIONS.USERS,
                    { _id: receiverId },
                    {
                        username: 1,
                        avatar_url: 1,
                        phone_number: 1
                    }
                );

                populatedRequests.push({
                    _id: request._id,
                    contact_id: receiverId,
                    status: request.status,
                    created_at: request.created_at,
                    updated_at: request.updated_at,
                    receiver_details: receiverDetails
                });
            }

            return populatedRequests;
        } catch (error) {
            console.error("Error getting sent requests:", error);
            throw error;
        }
    },

    async removeContact(userId, contactId) {
        try {
            // Xóa cả hai chiều của mối quan hệ
            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    $or: [
                        {
                            user_id: mongoHelper.extractObjectId(userId),
                            contact_id: mongoHelper.extractObjectId(contactId)
                        },
                        {
                            user_id: mongoHelper.extractObjectId(contactId),
                            contact_id: mongoHelper.extractObjectId(userId)
                        }
                    ]
                }
            );

            return true;
        } catch (error) {
            console.error("Error removing contact:", error);
            throw error;
        }
    },

    async blockContact(userId, contactId) {
        try {
            // Xóa mối quan hệ hiện tại nếu có
            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    $or: [
                        {
                            user_id: mongoHelper.extractObjectId(userId),
                            contact_id: mongoHelper.extractObjectId(contactId)
                        },
                        {
                            user_id: mongoHelper.extractObjectId(contactId),
                            contact_id: mongoHelper.extractObjectId(userId)
                        }
                    ]
                }
            );

            // Tạo mối quan hệ mới với trạng thái 'blocked'
            await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    user_id: mongoHelper.extractObjectId(userId),
                    contact_id: mongoHelper.extractObjectId(contactId),
                    status: ContactConstant.STATUS.BLOCKED,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            );

            return true;
        } catch (error) {
            console.error("Error blocking contact:", error);
            throw error;
        }
    },
};

export default ContactRepo;
