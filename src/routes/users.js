import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import ResponseUtils from "../utils/response.js";
import StatusConstant from "../constants/statusConstant.js";
import ApiConstant from "../constants/apiConstant.js";

const UserRouter = express.Router();

/**
 * @route   GET /users/search
 * @desc    Tìm kiếm người dùng qua số điện thoại hoặc ID
 * @access  Private
 */
UserRouter.get(ApiConstant.USERS.SEARCH.path, authMiddleware, (req, res, next) => {
    try {
        // Lấy query parameters
        const {query} = req.query;

        // TODO: Validate query
        // TODO: Search users by phone or ID in database

        // Mock data response
        const users = [
            {
                id: "user-1",
                phone: "0901234567",
                name: "Nguyễn Văn A",
                avatar: "https://example.com/avatar1.jpg",
                status: "online"
            },
            {
                id: "user-2",
                phone: "0907654321",
                name: "Trần Thị B",
                avatar: "https://example.com/avatar2.jpg",
                status: "offline"
            }
        ];

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
UserRouter.get(ApiConstant.USERS.DETAIL.path, authMiddleware, (req, res, next) => {
    try {
        const {id} = req.params;

        // TODO: Validate ID
        // TODO: Fetch user details from database

        // Mock user data
        const user = {
            id,
            phone: "0901234567",
            name: "Nguyễn Văn A",
            avatar: "https://example.com/avatar1.jpg",
            status: "online",
            bio: "Xin chào, tôi là người dùng Zalo",
            email: "example@email.com",
            createdAt: new Date(),
            lastSeen: new Date()
        };

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.USERS.DETAIL.description + ' thành công', {user})
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /users/:id
 * @desc    Cập nhật thông tin người dùng
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.UPDATE.path, authMiddleware, (req, res, next) => {
    try {
        const {id} = req.params;
        const {name, bio, email} = req.body;

        // Kiểm tra người dùng có quyền sửa thông tin này không
        if (req.user.id !== id) {
            return res.status(StatusConstant.FORBIDDEN).json(
                ResponseUtils.forbiddenResponse('Bạn không có quyền cập nhật thông tin của người dùng khác')
            );
        }

        // TODO: Validate input
        // TODO: Update user in database

        // Mock updated user data
        const updatedUser = {
            id,
            phone: "0901234567",
            name: name || "Nguyễn Văn A",
            bio: bio || "Xin chào, tôi là người dùng Zalo",
            email: email || "example@email.com",
            avatar: "https://example.com/avatar1.jpg",
            status: "online",
            updatedAt: new Date()
        };

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.USERS.UPDATE.description + ' thành công', {user: updatedUser})
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /users/:id/status
 * @desc    Cập nhật trạng thái người dùng
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.UPDATE_STATUS.path, authMiddleware, (req, res, next) => {
    try {
        const {id} = req.params;
        const {status} = req.body;

        // Kiểm tra người dùng có quyền sửa trạng thái này không
        if (req.user.id !== id) {
            return res.status(StatusConstant.FORBIDDEN).json(
                ResponseUtils.forbiddenResponse('Bạn không có quyền cập nhật trạng thái của người dùng khác')
            );
        }

        // Validate status
        const validStatuses = ['online', 'offline', 'busy'];
        if (!validStatuses.includes(status)) {
            return res.status(StatusConstant.BAD_REQUEST).json(
                ResponseUtils.errorResponse('Trạng thái không hợp lệ. Chỉ chấp nhận: online, offline, busy')
            );
        }

        // TODO: Update user status in database

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.USERS.UPDATE_STATUS.description + ' thành công', {status})
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /users/:id/profile-picture
 * @desc    Cập nhật ảnh đại diện
 * @access  Private
 */
UserRouter.put(ApiConstant.USERS.PROFILE_PICTURE.path, authMiddleware, (req, res, next) => {
    try {
        const {id} = req.params;

        // Kiểm tra người dùng có quyền sửa ảnh đại diện này không
        if (req.user.id !== id) {
            return res.status(StatusConstant.FORBIDDEN).json(
                ResponseUtils.forbiddenResponse('Bạn không có quyền cập nhật ảnh đại diện của người dùng khác')
            );
        }

        // TODO: Handle file upload (multer middleware should be added)
        // TODO: Process and store the uploaded image
        // TODO: Update user's profile picture URL in database

        // Mock avatar URL
        const avatarUrl = "https://example.com/new-avatar.jpg";

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.USERS.PROFILE_PICTURE.description + ' thành công', {
                avatarUrl
            })
        );
    } catch (error) {
        next(error);
    }
});

export default UserRouter;
