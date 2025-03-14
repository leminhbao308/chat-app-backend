import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import ResponseUtils from "../utils/response.js";
import StatusConstant from "../constants/statusConstant.js";
import ApiConstant from "../constants/apiConstant.js";

const AuthRouter = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
AuthRouter.post(ApiConstant.AUTH.REGISTER.path, (req, res, next) => {
    try {
        // Lấy dữ liệu từ body request
        const {phone, password, name} = req.body;

        // TODO: Validate input
        // TODO: Check if user already exists
        // TODO: Hash password
        // TODO: Create user in database

        // Tạo user object (giả lập)
        const user = {
            id: "generated-id",
            phone,
            name,
            password,
            createdAt: new Date()
        };

        // Trả về response
        return res.status(StatusConstant.CREATED).json(
            ResponseUtils.createdResponse(ApiConstant.AUTH.REGISTER.description + ' thành công', user)
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
AuthRouter.post(ApiConstant.AUTH.LOGIN.path, (req, res, next) => {
    try {
        const {email, password} = req.body;

        // TODO: Validate input
        // TODO: Check if user exists and verify password
        // TODO: Generate JWT token

        // Mock token for demonstration
        const token = "mock-jwt-token";
        const refreshToken = "mock-refresh-token";

        // Set refreshToken in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        const userData = {
            token,
            user: {
                id: "user-id",
                email,
                username: "example"
            }
        };

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.LOGIN.description + ' thành công', userData)
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
AuthRouter.post(ApiConstant.AUTH.LOGOUT.path, authMiddleware, (req, res, next) => {
    try {
        // Clear refreshToken cookie
        res.clearCookie('refreshToken');

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.LOGOUT.description + ' thành công')
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/refresh-token
 * @desc    Làm mới token xác thực
 * @access  Public (with refresh token)
 */
AuthRouter.post(ApiConstant.AUTH.REFRESH_TOKEN.path, (req, res, next) => {
    try {
        // Get refreshToken from cookie
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(StatusConstant.UNAUTHORIZED).json(
                ResponseUtils.unauthorizedResponse('Không tìm thấy Refresh Token')
            );
        }

        // TODO: Verify refresh token
        // TODO: Generate new access token

        // Mock new token
        const newToken = "new-mock-jwt-token";

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.REFRESH_TOKEN.description + ' thành công', {token: newToken})
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /auth/verify/:token
 * @desc    Xác thực email
 * @access  Public
 */
AuthRouter.get(ApiConstant.AUTH.VERIFY.path, (req, res, next) => {
    try {
        const {token} = req.params;

        // TODO: Verify email verification token
        // TODO: Update user's email verification status

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.VERIFY.description + ' thành công')
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Yêu cầu đặt lại mật khẩu
 * @access  Public
 */
AuthRouter.post(ApiConstant.AUTH.FORGOT_PASSWORD.path, (req, res, next) => {
    try {
        const {email} = req.body;

        // TODO: Check if user exists
        // TODO: Generate password reset token
        // TODO: Send password reset email

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.FORGOT_PASSWORD.description + ' đã được gửi tới email')
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /auth/reset-password
 * @desc    Đặt lại mật khẩu
 * @access  Public (with reset token)
 */
AuthRouter.post(ApiConstant.AUTH.RESET_PASSWORD.path, (req, res, next) => {
    try {
        const {token, newPassword} = req.body;

        // TODO: Verify password reset token
        // TODO: Hash new password
        // TODO: Update user's password

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.RESET_PASSWORD.description + ' thành công')
        );
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
AuthRouter.get(ApiConstant.AUTH.ME.path, authMiddleware, (req, res, next) => {
    try {
        // Lấy thông tin user từ middleware auth
        const user = req.user;

        // TODO: Fetch additional user details from database if needed

        // Thêm các thông tin khác vào user object
        const userDetails = {
            ...user,
            username: "example",
            createdAt: new Date()
        };

        return res.status(StatusConstant.OK).json(
            ResponseUtils.successResponse(ApiConstant.AUTH.ME.description + ' thành công', userDetails)
        );
    } catch (error) {
        next(error);
    }
});

export default AuthRouter;
