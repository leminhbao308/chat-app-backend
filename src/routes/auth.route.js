import express from "express";
import {validate} from "express-validation";
import AuthMiddleware from "../middlewares/auth.middleware.js";
import ApiConstant from "../constants/api.constant.js";
import validations from "../validations/index.js";
import 'dotenv/config';
import controllers from "../controllers/index.js";

const AuthRouter = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.REGISTER.path,
    validate(validations.auth.register, {keyByField: true}, {}),
    controllers.auth.register
);

/**
 * @route   POST /auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.LOGIN.path,
    validate(validations.auth.login, {keyByField: true}, {}),
    controllers.auth.login
);

/**
 * @route   POST /auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
AuthRouter.post(
    ApiConstant.AUTH.LOGOUT.path,
    AuthMiddleware,
    controllers.auth.logout
);

/**
 * @route   POST /auth/refresh-token
 * @desc    Làm mới token xác thực với refresh token
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.REFRESH_TOKEN.path,
    validate(validations.auth.refreshToken, {keyByField: true}, {}),
    controllers.auth.refreshToken
);

/**
 * @route   POST /auth/reset-password
 * @desc    Đặt lại mật khẩu
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.RESET_PASSWORD.path,
    validate(validations.auth.resetPassword, {keyByField: true}, {}),
    controllers.auth.resetPassword
);

/**
 * @route   POST /auth/change-password
 * @desc    Thay đổi mật khẩu
 * @access  Private
 */
AuthRouter.post(
    ApiConstant.AUTH.CHANGE_PASSWORD.path,
    AuthMiddleware,
    validate(validations.auth.changePassword, {keyByField: true}, {}),
    controllers.auth.changePassword
);

/**
 * @route   GET /auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
AuthRouter.get(
    ApiConstant.AUTH.ME.path,
    AuthMiddleware,
    controllers.auth.getUserInfo
);

export default AuthRouter;
