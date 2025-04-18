import repos from "../repos/index.js";
import StatusConstant from "../constants/status.constant.js";
import ResponseUtils from "../utils/response.util.js";
import ApiConstant from "../constants/api.constant.js";
import App from "../app.js";
import {ObjectId} from "mongodb";
import authRepo from "../repos/auth.repo.js";

const UserController = {
    searchUsersByPhoneNumber: async (req, res, next) => {
        try {
            // Lấy query parameters
            const {phone_number} = req.query;

            const users = await repos.users.getAllUsersByPhoneNumber(phone_number);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse(ApiConstant.USERS.SEARCH.description + ' thành công', users, users.length)
            );
        } catch (error) {
            next(error);
        }
    },

    getUserByUserId: async (req, res, next) => {
        try {
            const {id} = req.params;

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
    },

    updateUserByUserId: async (req, res, next) => {
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

            // Phát event thông báo cập nhật
            App.getIO().emit('user info updated', updatedUser);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.UPDATE.description + ' thành công', {user: updatedUser})
            );
        } catch (error) {
            next(error);
        }
    },

    getOldProfilePictureByUserId: async (req, res, next) => {
        try {
            const userId = ObjectId.createFromHexString(req.user.user_id);

            const avatars = await repos.user_avatars.getAvatarListByUserId(userId)

            return res.status(StatusConstant.OK).json(
                ResponseUtils.listResponse(ApiConstant.USERS.PROFILE_PICTURE_OLD.description + ' thành công',
                    avatars,
                    avatars.length
                ));
        } catch (error) {
            next(error)
        }
    },

    updateProfilePictureByUserId: async (req, res, next) => {
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

            // Phát event thông báo cập nhật avatar
            App.getIO().emit('avatar updated', updatedUser.avatar_url);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.USERS.PROFILE_PICTURE.description + ' thành công', {
                    updatedUser
                })
            );
        } catch (error) {
            next(error);
        }
    }
}

export default UserController
