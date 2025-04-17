import express from "express";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import ApiConstant from "../constants/api.constant.js";
import {validate} from "express-validation";
import validations from "../validations/index.js";
import MulterMiddleware from "../middlewares/multer.middleware.js";
import controllers from "../controllers/index.js";

const UserRouter = express.Router();

/**
 * @route   GET /users/search?phone_number=
 * @desc    Tìm kiếm người dùng qua số điện thoại
 * @access  Private
 */
UserRouter.get(
    ApiConstant.USERS.SEARCH.path,
    AuthMiddleware,
    validate(validations.user.getUserByPhone, {keyByField: true}, {}),
    controllers.user.searchUsersByPhoneNumber
);

/**
 * @route   GET /users/:id
 * @desc    Lấy thông tin chi tiết của người dùng
 * @access  Private
 */
UserRouter.get(
    ApiConstant.USERS.DETAIL.path,
    AuthMiddleware,
    validate(validations.user.getUserById, {keyByField: true}, {}),
    controllers.user.getUserByUserId
);

/**
 * @route   POST /users/update-info
 * @desc    Cập nhật thông tin người dùng
 * @access  Private
 */
UserRouter.post(
    ApiConstant.USERS.UPDATE.path,
    AuthMiddleware,
    validate(validations.user.updateUser, {keyByField: true}, {}),
    controllers.user.updateUserByUserId
);

/**
 * @route   GET /users/profile-picture/old
 * @desc    Lấy danh sách ảnh đại diện cũ
 * @access  Private
 */
UserRouter.get(ApiConstant.USERS.PROFILE_PICTURE_OLD.path,
    AuthMiddleware,
    controllers.user.getOldProfilePictureByUserId
);

/**
 * @route   POST /users/profile-picture
 * @desc    Cập nhật ảnh đại diện
 * @access  Private
 */
UserRouter.post(ApiConstant.USERS.PROFILE_PICTURE.path,
    AuthMiddleware,
    MulterMiddleware.single('file'),
    controllers.user.updateProfilePictureByUserId
);

export default UserRouter;
