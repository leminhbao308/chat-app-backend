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
 * @route   POST /auth/verify-phone
 * @desc    Xác thực số điện thoại
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.VERIFY.path,
    validate(validations.auth.verifyPhoneNumber, {keyByField: true}, {}),
    controllers.auth.verifyPhoneNumber
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

// /**
//  * @route   POST /auth/reset-password
//  * @desc    Yêu cầu đặt lại mật khẩu
//  * @access  Public
//  */
// AuthRouter.post(
//     ApiConstant.AUTH.RESET_PASSWORD.path,
//     validate(validations.auth.resetPasswordRequest, {keyByField: true}, {}),
//     controllers.auth.resetPasswordRequest
// );

// ✅ Gửi yêu cầu reset password (gửi mã OTP)
AuthRouter.post(
    ApiConstant.AUTH.FORGOT_PASSWORD.path,
    validate(validations.auth.resetPasswordRequest, {keyByField: true}, {}),
    controllers.auth.resetPasswordRequest
);

/**
 * @route   POST /auth/verify-reset-code
 * @desc    Xác thực mã đặt lại mật khẩu
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.VERIFY_RESET_CODE.path,
    validate(validations.auth.verifyPasswordResetCode, {keyByField: true}, {}),
    controllers.auth.verifyPasswordResetCode
);

// /**
//  * @route   POST /auth/reset-password
//  * @desc    Đặt lại mật khẩu với reset code
//  * @access  Public
//  */
// AuthRouter.post(
//     ApiConstant.AUTH.RESET_PASSWORD.path,
//     validate(validations.auth.resetPassword, {keyByField: true}, {}),
//     controllers.auth.resetPassword
// );

// ✅ Xác thực mã OTP và đặt lại mật khẩu
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

/**
 * @route   PUT /auth/profile
 * @desc    Cập nhật thông tin cá nhân
 * @access  Private
 */
// AuthRouter.put(
//     ApiConstant.AUTH.UPDATE_PROFILE.path,
//     authMiddleware,
//     validate(validations.auth.updateProfile, { keyByField: true }, {}),
//     async (req, res, next) => {
//         try {
//
//             const userId = req.user.user_id;
//             const { first_name, last_name, date_of_birth, avatar_url, phone_number } = req.body;

//             // Find user by ID
//             const user = await mongoHelper.findOne(
//                 DatabaseConstant.COLLECTIONS.USERS,
//                 { _id: userId }
//             );

//             if (!user) {
//                 return res.status(StatusConstant.NOT_FOUND).json(
//                     ResponseUtils.errorResponse('Không tìm thấy người dùng')
//                 );
//             }

//             // Check if new phone number already exists
//             if (phone_number && phone_number !== user.phone_number) {
//                 const existingUser = await mongoHelper.findOne(
//                     DatabaseConstant.COLLECTIONS.USERS,
//                     { phone_number, _id: { $ne: userId } }
//                 );

//                 if (existingUser) {
//                     return res.status(StatusConstant.CONFLICT).json(
//                         ResponseUtils.errorResponse('Số điện thoại đã được sử dụng bởi người dùng khác')
//                     );
//                 }
//             }

//             // Prepare update object
//             const updateData = {
//                 ...(first_name && { first_name }),
//                 ...(last_name && { last_name }),
//                 ...(date_of_birth && { date_of_birth }),
//                 ...(avatar_url && { avatar_url }),
//                 ...(phone_number && { phone_number, is_verified: phone_number === user.phone_number ? user.is_verified : false }),
//                 updated_at: new Date()
//             };

//             // Update user profile
//             await mongoHelper.updateOne(
//                 DatabaseConstant.COLLECTIONS.USERS,
//                 { _id: userId },
//                 { $set: updateData }
//             );

//             // Get updated user
//             const updatedUser = await mongoHelper.findOne(
//                 DatabaseConstant.COLLECTIONS.USERS,
//                 { _id: userId }
//             );

//             // Remove password from response
//             const { password, ...userWithoutPassword } = updatedUser;

//             // If phone number changed, generate verification code
//             if (phone_number && phone_number !== user.phone_number) {
//                 // Generate verification code
//                 const verificationCode = crypto.randomInt(100000, 999999).toString();

//                 // Store verification code
//                 await mongoHelper.insertOne(
//                     DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS,
//                     {
//                         user_id: userId,
//                         phone_number,
//                         verification_code: verificationCode,
//                         expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//                         created_at: new Date()
//                     }
//                 );

//                 // TODO: Send verification code via SMS

//                 return res.status(StatusConstant.OK).json(
//                     ResponseUtils.successResponse(
//                         'Cập nhật thông tin cá nhân thành công. Mã xác thực đã được gửi tới số điện thoại mới.',
//                         userWithoutPassword
//                     )
//                 );
//             }

//             return res.status(StatusConstant.OK).json(
//                 ResponseUtils.successResponse(
//                     'Cập nhật thông tin cá nhân thành công',
//                     userWithoutPassword
//                 )
//             );
//         } catch (error) {
//             next(error);
//         }
//     }
// );

export default AuthRouter;
