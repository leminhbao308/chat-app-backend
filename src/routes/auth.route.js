import express from "express";
import {validate} from "express-validation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import authMiddleware from "../middlewares/authMiddleware.js";
import ResponseUtils from "../utils/response.js";
import StatusConstant from "../constants/statusConstant.js";
import ApiConstant from "../constants/apiConstant.js";
import DatabaseConstant from "../constants/databaseConstant.js";
import validations from "../validations/index.js";
import mongoHelper from "../helper/MongoHelper.js"
import {ObjectId} from "mongodb";

const AuthRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "2h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

/**
 * @route   POST /auth/register
 * @desc    Đăng ký tài khoản mới
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.REGISTER.path,
    validate(validations.auth.register, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const {
                first_name,
                last_name,
                date_of_birth,
                password,
                avatar_url,
                phone_number
            } = req.body;

            // Check if user already exists
            const existingUser = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (existingUser) {
                return res.status(StatusConstant.CONFLICT).json(
                    ResponseUtils.errorResponse('Số điện thoại đã được đăng ký')
                );
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user object
            const user = {
                first_name,
                last_name,
                date_of_birth,
                phone_number,
                avatar_url,
                password: hashedPassword,
                is_verified: false,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            };

            // Insert user into database
            const result = await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.USERS, user);

            // Get the inserted user
            const insertedUser = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: result.insertedId }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = insertedUser;

            // Generate verification code for phone number
            const verificationCode = crypto.randomInt(100000, 999999).toString();

            // Store verification code
            await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS, {
                user_id: result.insertedId,
                phone_number,
                verification_code: verificationCode,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                created_at: new Date()
            });

            // TODO: Send verification code via SMS (implement with SMS service)

            return res.status(StatusConstant.CREATED).json(
                ResponseUtils.createdResponse(
                    ApiConstant.AUTH.REGISTER.description + ' thành công. Mã xác thực đã được gửi tới số điện thoại của bạn.',
                    userWithoutPassword
                )
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/verify-phone
 * @desc    Xác thực số điện thoại
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.VERIFY.path,
    validate(validations.auth.verifyPhoneNumber, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { phone_number, verification_code } = req.body;

            // Find user by phone
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (!user) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.errorResponse('Người dùng không tồn tại')
                );
            }

            // Find verification token
            const verificationToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS,
                {
                    user_id: user._id,
                    phone_number,
                    verification_code,
                    expires_at: { $gt: new Date() }
                }
            );

            if (!verificationToken) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã xác thực không hợp lệ hoặc đã hết hạn')
                );
            }

            // Mark user as verified
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: user._id },
                { $set: { is_verified: true, updated_at: new Date() } }
            );

            // Delete used verification token
            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS,
                { _id: verificationToken._id }
            );

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Xác thực số điện thoại thành công')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.LOGIN.path,
    validate(validations.auth.login, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { phone_number, password, device_id, device_type } = req.body;

            // Find user by phone
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (!user) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Thông tin đăng nhập không chính xác')
                );
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(StatusConstant.FORBIDDEN).json(
                    ResponseUtils.forbiddenResponse('Tài khoản đã bị vô hiệu hóa')
                );
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Thông tin đăng nhập không chính xác')
                );
            }

            // Generate JWT token
            const payload = {
                user_id: user._id,
                phone_number: user.phone_number
            };

            const token = jwt.sign(payload, JWT_SECRET, {
                expiresIn: TOKEN_EXPIRY
            });

            // Generate refresh token
            const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
                expiresIn: REFRESH_TOKEN_EXPIRY
            });

            // Store refresh token in database
            await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.REFRESH_TOKENS, {
                user_id: user._id,
                token: refreshToken,
                device_id,
                device_type,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                created_at: new Date()
            });

            // Update last login
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: user._id },
                { $set: { last_login: new Date(), updated_at: new Date() } }
            );

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            // Set refreshToken in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(
                    ApiConstant.AUTH.LOGIN.description + ' thành công',
                    {
                        token,
                        refresh_token: refreshToken,
                        user: userWithoutPassword
                    }
                )
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
AuthRouter.post(
    ApiConstant.AUTH.LOGOUT.path,
    authMiddleware,
    async (req, res, next) => {
        try {
            // Get refresh token from cookie or body
            const refreshToken = req.cookies.refreshToken || req.body.refresh_token;

            if (refreshToken) {
                // Delete refresh token from database
                await mongoHelper.deleteOne(
                    DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                    { token: refreshToken }
                );

                // Clear cookie
                res.clearCookie('refreshToken');
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.AUTH.LOGOUT.description + ' thành công')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/refresh-token
 * @desc    Làm mới token xác thực với refresh token
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.REFRESH_TOKEN.path,
    validate(validations.auth.refreshToken, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            // Get refresh token from cookie or body
            const refreshToken = req.cookies.refreshToken || req.body.refresh_token;

            if (!refreshToken) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Không tìm thấy Refresh Token')
                );
            }

            // Find token in database
            const storedToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                { token: refreshToken }
            );

            if (!storedToken) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Refresh Token không hợp lệ')
                );
            }

            // Verify refresh token
            try {
                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

                // Generate new token
                const newToken = jwt.sign(
                    { user_id: decoded.user_id, phone_number: decoded.phone_number },
                    JWT_SECRET,
                    { expiresIn: TOKEN_EXPIRY }
                );

                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse(
                        ApiConstant.AUTH.REFRESH_TOKEN.description + ' thành công',
                        { token: newToken }
                    )
                );
            } catch (error) {
                // Token expired or invalid
                await mongoHelper.deleteOne(
                    DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                    { token: refreshToken }
                );

                res.clearCookie('refreshToken');

                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Refresh Token hết hạn hoặc không hợp lệ')
                );
            }
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/reset-password
 * @desc    Yêu cầu đặt lại mật khẩu
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.RESET_PASSWORD.path,
    validate(validations.auth.resetPasswordRequest, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { phone_number } = req.body;

            // Find user by phone
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (!user) {
                // Don't reveal that user doesn't exist for security
                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse('Mã đặt lại mật khẩu đã được gửi nếu số điện thoại có tồn tại')
                );
            }

            // Generate reset code
            const resetCode = crypto.randomInt(100000, 999999).toString();

            // Delete any existing reset tokens for this user
            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                { user_id: user._id }
            );

            // Store reset code
            await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {
                    user_id: user._id,
                    phone_number,
                    reset_code: resetCode,
                    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    created_at: new Date()
                }
            );

            // TODO: Send reset code via SMS (implement with SMS service)

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Mã đặt lại mật khẩu đã được gửi tới số điện thoại của bạn')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/verify-reset-code
 * @desc    Xác thực mã đặt lại mật khẩu
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.VERIFY_RESET_CODE.path,
    validate(validations.auth.verifyPasswordResetCode, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { phone_number, reset_code } = req.body;

            // Find user by phone
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (!user) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã đặt lại mật khẩu không hợp lệ')
                );
            }

            // Find reset token
            const resetToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {
                    user_id: user._id,
                    phone_number,
                    reset_code,
                    expires_at: { $gt: new Date() }
                }
            );

            if (!resetToken) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
                );
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Mã đặt lại mật khẩu hợp lệ')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/reset-password
 * @desc    Đặt lại mật khẩu với reset code
 * @access  Public
 */
AuthRouter.post(
    ApiConstant.AUTH.RESET_PASSWORD.path,
    validate(validations.auth.resetPassword, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { phone_number, reset_code, new_password } = req.body;

            // Find user by phone
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { phone_number }
            );

            if (!user) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã đặt lại mật khẩu không hợp lệ')
                );
            }

            // Find reset token
            const resetToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {
                    user_id: user._id,
                    phone_number,
                    reset_code,
                    expires_at: { $gt: new Date() }
                }
            );

            if (!resetToken) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn')
                );
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: user._id },
                { $set: { password: hashedPassword, updated_at: new Date() } }
            );

            // Delete used reset token
            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                { _id: resetToken._id }
            );

            // Invalidate all refresh tokens for this user
            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                { user_id: user._id }
            );

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.AUTH.RESET_PASSWORD.description + ' thành công')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /auth/change-password/:user_id
 * @desc    Thay đổi mật khẩu
 * @access  Private
 */
AuthRouter.post(
    ApiConstant.AUTH.CHANGE_PASSWORD.path,
    authMiddleware,
    validate(validations.auth.changePassword, { keyByField: true }, {}),
    async (req, res, next) => {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.params.user_id;

            // Find user by ID
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: userId }
            );

            if (!user) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Không tìm thấy người dùng')
                );
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(current_password, user.password);

            if (!isPasswordValid) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mật khẩu hiện tại không chính xác')
                );
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: userId },
                { $set: { password: hashedPassword, updated_at: new Date() } }
            );

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Thay đổi mật khẩu thành công')
            );
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   GET /auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
AuthRouter.get(
    ApiConstant.AUTH.ME.path,
    authMiddleware,
    async (req, res, next) => {
        try {
            const userId = ObjectId.createFromHexString(req.user.user_id);

            // Find user by ID
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: userId }
            );

            if (!user) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.errorResponse('Không tìm thấy người dùng')
                );
            }

            // Remove password from response
            const { password, ...userWithoutPassword } = user;

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(
                    ApiConstant.AUTH.ME.description + ' thành công',
                    userWithoutPassword
                )
            );
        } catch (error) {
            next(error);
        }
    }
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
