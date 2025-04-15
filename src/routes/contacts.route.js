// routes/contacts.route.js
import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import ApiConstant from "../constants/api.constant.js";
import controllers from "../controllers/index.js";
import ResponseUtils from "../utils/response.js";

const ContactRouter = express.Router();

// Lấy danh sách liên hệ
ContactRouter.get(
    ApiConstant.CONTACTS.LIST.path,
    AuthMiddleware,
    controllers.contact.getContactList
);

// Lấy danh sách yêu cầu kết bạn đang chờ
ContactRouter.get(
    ApiConstant.CONTACTS.REQUESTS.path,
    AuthMiddleware,
    controllers.contact.getPendingRequests
);

// Lấy danh sách yêu cầu kết bạn đã gửi
ContactRouter.get(
    ApiConstant.CONTACTS.SENT_REQUESTS.path,
    AuthMiddleware,
    controllers.contact.getSentRequests
);

// Gửi yêu cầu kết bạn
ContactRouter.post(
    ApiConstant.CONTACTS.ADD.path,
    AuthMiddleware,
    controllers.contact.createContactRequest
);

// Chấp nhận yêu cầu kết bạn
ContactRouter.post(
    ApiConstant.CONTACTS.ACCEPT.path,
    AuthMiddleware,
    controllers.contact.acceptContactRequest
);

// Từ chối yêu cầu kết bạn
ContactRouter.post(
    ApiConstant.CONTACTS.REJECT.path,
    AuthMiddleware,
    ResponseUtils.developingResponse
);

// Xóa liên hệ
ContactRouter.post(
    ApiConstant.CONTACTS.REMOVE.path,
    AuthMiddleware,
    controllers.contact.removeContact
);

// Chặn liên hệ
ContactRouter.post(
    ApiConstant.CONTACTS.BLOCK.path,
    AuthMiddleware,
    controllers.contact.blockContact
);

// Bỏ chặn liên hệ
ContactRouter.post(
    ApiConstant.CONTACTS.UNBLOCK.path,
    AuthMiddleware,
    ResponseUtils.developingResponse
)

// Lấy danh sách liên hệ bị chặn
ContactRouter.post(
    ApiConstant.CONTACTS.BLOCKED.path,
    AuthMiddleware,
    ResponseUtils.developingResponse
)

export default ContactRouter;
