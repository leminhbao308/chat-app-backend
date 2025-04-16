// controllers/contact.controller.js
import mongoHelper from '../helper/MongoHelper.js';
import ResponseUtils from '../utils/response.js';
import StatusConstant from '../constants/status.constant.js';
import DatabaseConstant from '../constants/database.constant.js';
import ContactConstant from '../constants/contact.constant.js';
import repos from '../repos/index.js';

const ContactController = {
    async createContactRequest(req, res) {
        try {
            const requestSender = req.user.user_id;
            const { userId: requestReceiver } = req.params;

            if (!requestReceiver) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Contact ID is required")
                );
            }

            // Đảm bảo requestReceiver không phải là chính user hiện tại
            if (requestSender === requestReceiver) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Cannot add yourself as a contact")
                );
            }

            // Kiểm tra contact có tồn tại không
            const contactExists = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: mongoHelper.extractObjectId(requestReceiver) }
            );

            if (!contactExists) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.notFoundResponse("Contact not found")
                );
            }

            // Gửi yêu cầu kết bạn hoặc chấp nhận yêu cầu nếu đã tồn tại
            const result = await repos.contact.createContactRequest(requestSender, requestReceiver);

            if (result.isAccepted) {
                // Nếu yêu cầu đã được chấp nhận, tạo conversation
                await repos.conversation.createConversationForContacts(requestSender, requestReceiver);

                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse("Contact request accepted and conversation created")
                );
            }

            res.status(StatusConstant.CREATED).json(
                ResponseUtils.successResponse("Contact request sent")
            );
        } catch (error) {
            console.error("Error creating contact request:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to create contact request")
            );
        }
    },

    async acceptContactRequest(req, res) {
        try {
            const userId = req.user.user_id;
            const { requestId: request_id } = req.params;

            // Lấy thông tin yêu cầu kết bạn
            const request = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONTACTS,
                {
                    _id: mongoHelper.extractObjectId(request_id),
                    contact_id: mongoHelper.extractObjectId(userId),
                    status: ContactConstant.STATUS.PENDING
                }
            );

            if (!request) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.notFoundResponse("Contact request not found")
                );
            }

            // Chấp nhận yêu cầu kết bạn
            await repos.contact.acceptContactRequest(userId, request.user_id);

            // Tạo conversation cho hai người dùng
            await repos.conversation.createConversationForContacts(userId, request.user_id);

            res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse("Contact request accepted and conversation created")
            );
        } catch (error) {
            console.error("Error accepting contact request:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to accept contact request")
            );
        }
    },

    async getContactList(req, res) {
        try {
            const userId = req.user.user_id;

            const contacts = await repos.contact.getContactList(userId);

            res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse("Contacts retrieved successfully", contacts, contacts.length)
            );
        } catch (error) {
            console.error("Error getting contact list:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to get contact list")
            );
        }
    },

    async getPendingRequests(req, res) {
        try {
            const userId = req.user.user_id;

            const pendingRequests = await repos.contact.getPendingRequests(userId);

            res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse("Pending requests retrieved successfully", pendingRequests, pendingRequests.length)
            );
        } catch (error) {
            console.error("Error getting pending requests:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to get pending requests")
            );
        }
    },

    async getSentRequests(req, res) {
        try {
            const userId = req.user.user_id;

            const sentRequests = await repos.contact.getSentRequests(userId);

            res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse("Sent requests retrieved successfully", sentRequests, sentRequests.length)
            );
        } catch (error) {
            console.error("Error getting sent requests:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to get sent requests")
            );
        }
    },

    async removeContact(req, res) {
        try {
            const userId = req.user.user_id;
            const { contact_id } = req.params;

            await repos.contact.removeContact(userId, contact_id);

            res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse("Contact removed successfully")
            );
        } catch (error) {
            console.error("Error removing contact:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to remove contact")
            );
        }
    },

    async blockContact(req, res) {
        try {
            const userId = req.user.user_id;
            const { contact_id } = req.params;

            await repos.contact.blockContact(userId, contact_id);

            res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse("Contact blocked successfully")
            );
        } catch (error) {
            console.error("Error blocking contact:", error);
            res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse("Failed to block contact")
            );
        }
    }
};

export default ContactController;
