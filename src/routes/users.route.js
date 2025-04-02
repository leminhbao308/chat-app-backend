import express from "express";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import ResponseUtils from "../utils/response.js";
import StatusConstant from "../constants/status.constant.js";
import ApiConstant from "../constants/api.constant.js";
import repos from "../repos/index.js";
import {validate} from "express-validation";
import validations from "../validations/index.js";

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
 * @route   PUT /users/profile-picture
 * @desc    Cập nhật ảnh đại diện
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.PROFILE_PICTURE.path, AuthMiddleware,
    validate(validations.user.updateUser, {keyByField: true}, {}),
    async (req, res, next) => {
    try {
        const id = req.user.user_id;
        const {avatar_url} = req.body;

        // TODO: Handle file upload (multer middleware should be added)
        // TODO: Process and store the uploaded image
        // TODO: Update user's profile picture URL in database

        const updatedUser = await repos.users.updateUserInfo(id, {
            avatar_url
        });

        if (!updatedUser)
            return res.status(StatusConstant.BAD_REQUEST).json(
                ResponseUtils.badRequestResponse(ApiConstant.USERS.PROFILE_PICTURE.description + ' thất bại')
            )

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
