import express from "express";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import ResponseUtils from "../utils/response.js";
import StatusConstant from "../constants/status.constant.js";
import ApiConstant from "../constants/api.constant.js";
import repos from "../repos/index.js";
import {validate} from "express-validation";
import validations from "../validations/index.js";
import MulterMiddleware from "../middlewares/multer.middleware.js";
import {ObjectId} from "mongodb";
import authRepo from "../repos/auth.repo.js";

const UserRouter = express.Router();

/**
 * @route   GET /users/search
 * @desc    Tìm kiếm người dùng qua số điện thoại hoặc ID
 * @access  Private
 */
UserRouter.get(ApiConstant.USERS.SEARCH.path, AuthMiddleware,
    validate(validations.user.getUserByPhone, {keyByField: true}, {}),
    async (req, res, next) => {
        try {
            // Lấy query parameters
            const {phone_number} = req.query;

            const users = await repos.users.getAllUsersByPhoneNumber(phone_number);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse(ApiConstant.USERS.SEARCH.description + ' thành công', {users}, users.length)
            );
        } catch (error) {
            next(error);
        }
    });

/**
 * @route   GET /users/:id
 * @desc    Lấy thông tin chi tiết của người dùng
 * @access  Private
 */
UserRouter.get(ApiConstant.USERS.DETAIL.path, AuthMiddleware,
    validate(validations.user.getUserById, {keyByField: true}, {}),
    async (req, res, next) => {
        try {
            const {id} = req.params;

            // TODO: Fetch user details from database
            const user = await repos.auth.getUserById(id);

            if (!user)
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse(ApiConstant.USERS.DETAIL.description + ' thất bại')
                )

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.DETAIL.description + ' thành công', {user})
            );
        } catch (error) {
            next(error);
        }
    });

/**
 * @route   PUT /users/update-info
 * @desc    Cập nhật thông tin người dùng
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.UPDATE.path, AuthMiddleware,
    validate(validations.user.updateUser, {keyByField: true}, {}),
    async (req, res, next) => {
        try {
            const id = req.user.user_id;
            const data = req.body;

            if (!data)
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse("Không có dữ liệu cần cập nhật")
                )

            const updatedUser = await repos.users.updateUserInfo(id, data);

            if (!updatedUser)
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse(ApiConstant.USERS.UPDATE.description + ' thất bại')
                )

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.UPDATE.description + ' thành công', {user: updatedUser})
            );
        } catch (error) {
            next(error);
        }
    });

/**
 * @route   PUT /users/status
 * @desc    Cập nhật trạng thái người dùng
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.UPDATE_STATUS.path, AuthMiddleware,
    validate(validations.user.toggleUserStatus, {keyByField: true}, {}),
    async (req, res, next) => {
        try {
            const id = req.user.user_id;
            const {online_status} = req.body;

            const updatedUser = await repos.users.updateUserInfo(id, {online_status});

            if (!updatedUser)
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse(ApiConstant.USERS.UPDATE_STATUS.description + ' thất bại')
                )

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.UPDATE_STATUS.description + ' thành công', updatedUser)
            );
        } catch (error) {
            next(error);
        }
    });

/**
 * @route   GET /users/profile-picture/old
 * @desc    Lấy danh sách ảnh đại diện cũ
 * @access  Private
 */
UserRouter.get(ApiConstant.USERS.PROFILE_PICTURE_OLD.path,
    AuthMiddleware,
    async (req, res, next) => {
        try {
            const userId = ObjectId.createFromHexString(req.user.user_id);

            const avatars = await repos.user_avatars.getAvatarListByUserId(userId)

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.PROFILE_PICTURE_OLD.description + ' thành công', {
                    avatars
                }));
        } catch (error) {
            next(error)
        }
    });

/**
 * @route   POST /users/profile-picture
 * @desc    Cập nhật ảnh đại diện
 * @access  Private
 */
UserRouter.post(ApiConstant.USERS.PROFILE_PICTURE.path, AuthMiddleware,
    MulterMiddleware.single('file'),
    async (req, res, next) => {
        try {
            // Check if file was uploaded
            if (!req.file) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse('No file uploaded')
                );
            }

            const id = req.user.user_id;

            const user = await authRepo.getUserById(id)
            const old_avatar_url = user.avatar_url;

            const avatar_url = await repos.s3.uploadFile(req.file);

            if (!avatar_url) {
                return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                    ResponseUtils.serverErrorResponse('Failed to upload file')
                );
            }

            const updatedUser = await repos.users.updateUserInfo(id, {
                avatar_url
            });

            if (!updatedUser)
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.badRequestResponse(ApiConstant.USERS.PROFILE_PICTURE.description + ' thất bại')
                )

            await repos.user_avatars.addOldUserAvatar(id, old_avatar_url);
            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.PROFILE_PICTURE.description + ' thành công', {
                    updatedUser
                })
            );
        } catch (error) {
            next(error);
        }
    });

export default UserRouter;
