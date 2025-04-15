import mongoHelper from "../helper/MongoHelper.js";
import ContactConstant from "../constants/contact.constant.js";
import DatabaseConstant from "../constants/database.constant.js";

const ContactRepo = {
    async createContactRequest(userId, contactId) {
        try {
            // Kiểm tra xem đã có yêu cầu kết bạn từ người kia chưa
            const existingRequest = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    user_id: mongoHelper.extractObjectId(contactId),
                    contact_id: mongoHelper.extractObjectId(userId)
                }
            );

            if (existingRequest) {
                // Nếu đã có yêu cầu từ người kia, chấp nhận luôn
                if (existingRequest.status === ContactConstant.STATUS.PENDING) {
                    await this.acceptContactRequest(contactId, userId);
                    return { isAccepted: true };
                }
                return { isAccepted: false, existingRequest };
            }

            // Nếu chưa có yêu cầu nào, tạo mới
            const newContact = {
                user_id: mongoHelper.extractObjectId(userId),
                contact_id: mongoHelper.extractObjectId(contactId),
                status: ContactConstant.STATUS.PENDING,
                created_at: new Date(),
                updated_at: new Date()
            };

            const result = await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                newContact
            );

            return { isAccepted: false, newRequest: result };
        } catch (error) {
            console.error("Error creating contact request:", error);
            throw error;
        }
    },

    async acceptContactRequest(userId, contactId) {
        try {
            // Cập nhật trạng thái request thành 'accepted'
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    user_id: mongoHelper.extractObjectId(contactId),
                    contact_id: mongoHelper.extractObjectId(userId),
                    status: ContactConstant.STATUS.PENDING
                },
                {
                    $set: {
                        status: ContactConstant.STATUS.ACCEPTED,
                        updated_at: new Date()
                    }
                }
            );

            // Tạo mối quan hệ hai chiều bằng cách thêm một record ngược lại
            const existingReverse = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    user_id: mongoHelper.extractObjectId(userId),
                    contact_id: mongoHelper.extractObjectId(contactId)
                }
            );

            if (!existingReverse) {
                await mongoHelper.insertOne(
                    DatabaseConstant.COLLECTIONS.CONTACTS,
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        contact_id: mongoHelper.extractObjectId(contactId),
                        status: ContactConstant.STATUS.ACCEPTED,
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                );
            } else {
                await mongoHelper.updateOne(
                    DatabaseConstant.COLLECTIONS.CONTACTS,
                    {
                        user_id: mongoHelper.extractObjectId(userId),
                        contact_id: mongoHelper.extractObjectId(contactId)
                    },
                    {
                        $set: {
                            status: ContactConstant.STATUS.ACCEPTED,
                            updated_at: new Date()
                        }
                    }
                );
            }

            return true;
        } catch (error) {
            console.error("Error accepting contact request:", error);
            throw error;
        }
    },

    async getContactList(userId) {
        try {
            // Lấy danh sách contact đã được chấp nhận
            return await mongoHelper.aggregate(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                [
                    {
                        $match: {
                            user_id: mongoHelper.extractObjectId(userId),
                            status: ContactConstant.STATUS.ACCEPTED
                        }
                    },
                    {
                        $lookup: {
                            from: DatabaseConstant.COLLECTIONS.USERS,
                            localField: 'contact_id',
                            foreignField: '_id',
                            as: 'contact_details'
                        }
                    },
                    {
                        $unwind: '$contact_details'
                    },
                    {
                        $project: {
                            _id: 1,
                            contact_id: 1,
                            status: 1,
                            created_at: 1,
                            updated_at: 1,
                            'contact_details.username': 1,
                            'contact_details.avatar_url': 1,
                            'contact_details.phone_number': 1
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error getting contact list:", error);
            throw error;
        }
    },

    async getPendingRequests(userId) {
        try {
            // Lấy danh sách yêu cầu kết bạn đang chờ duyệt
            return await mongoHelper.aggregate(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                [
                    {
                        $match: {
                            contact_id: mongoHelper.extractObjectId(userId),
                            status: ContactConstant.STATUS.PENDING
                        }
                    },
                    {
                        $lookup: {
                            from: DatabaseConstant.COLLECTIONS.USERS,
                            localField: 'user_id',
                            foreignField: '_id',
                            as: 'requester_details'
                        }
                    },
                    {
                        $unwind: '$requester_details'
                    },
                    {
                        $project: {
                            _id: 1,
                            user_id: 1,
                            status: 1,
                            created_at: 1,
                            updated_at: 1,
                            'requester_details.username': 1,
                            'requester_details.avatar_url': 1,
                            'requester_details.phone_number': 1
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error getting pending requests:", error);
            throw error;
        }
    },

    async getSentRequests(userId) {
        try {
            // Lấy danh sách yêu cầu kết bạn đã gửi
            return await mongoHelper.aggregate(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                [
                    {
                        $match: {
                            user_id: mongoHelper.extractObjectId(userId),
                            status: ContactConstant.STATUS.PENDING
                        }
                    },
                    {
                        $lookup: {
                            from: DatabaseConstant.COLLECTIONS.USERS,
                            localField: 'contact_id',
                            foreignField: '_id',
                            as: 'receiver_details'
                        }
                    },
                    {
                        $unwind: '$receiver_details'
                    },
                    {
                        $project: {
                            _id: 1,
                            contact_id: 1,
                            status: 1,
                            created_at: 1,
                            updated_at: 1,
                            'receiver_details.username': 1,
                            'receiver_details.avatar_url': 1,
                            'receiver_details.phone_number': 1
                        }
                    }
                ]
            );
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

    async isContact(userId, contactId) {
        try {
            const contact = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    user_id: mongoHelper.extractObjectId(userId),
                    contact_id: mongoHelper.extractObjectId(contactId),
                    status: ContactConstant.STATUS.ACCEPTED
                }
            );

            return !!contact;
        } catch (error) {
            console.error("Error checking contact status:", error);
            throw error;
        }
    }
};

export default ContactRepo;
