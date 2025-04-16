import repos from "../repos/index.js";
import StatusConstant from "../constants/status.constant.js";
import ResponseUtils from "../utils/response.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import ApiConstant from "../constants/api.constant.js";
import jwt from "jsonwebtoken";
import {ObjectId} from "mongodb";
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "2h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const DEFAULT_USER_AVATAR_URL = process.env.DEFAULT_USER_AVATAR_URL;
const DEFAULT_THUMBNAIL_URL = process.env.DEFAULT_THUMBNAIL_URL;

const AuthController = {
    register: async (req, res, next) => {
        try {
            const {
                first_name,
                last_name,
                gender, // 'male' or 'female'
                date_of_birth,
                password,
                avatar_url,
                thumbnail_url,
                phone_number
            } = req.body;

            // Check if user already exists
            const isUserExisting = await repos.auth.isUserExisting(phone_number);

            if (isUserExisting) {
                return res.status(StatusConstant.CONFLICT).json(
                    ResponseUtils.errorResponse('Số điện thoại đã được đăng ký', StatusConstant.CONFLICT)
                );
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user object
            const user = {
                first_name,
                last_name,
                gender,
                date_of_birth,
                phone_number,
                avatar_url: avatar_url ? avatar_url : DEFAULT_USER_AVATAR_URL,
                thumbnail_url: thumbnail_url ? thumbnail_url : DEFAULT_THUMBNAIL_URL,
                password: hashedPassword,
                // is_verified: false,
                is_verified: true, // vì đã xác thực số điện thoại trong quá trình đăng ký.
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
                online_status: "online"
            };

            // Insert user into database
            const result = await repos.auth.saveUser(user);

            console.log(result)

            // Generate verification code for phone number
            const verificationCode = crypto.randomInt(100000, 999999).toString();

            // Store verification code
            await repos.auth.saveVerificationToken(
                result._id,
                phone_number,
                verificationCode
            );

            // TODO: Send verification code via SMS (implement with SMS service)

            return res.status(StatusConstant.CREATED).json(
                ResponseUtils.createdResponse(
                    ApiConstant.AUTH.REGISTER.description + ' thành công. Mã xác thực đã được gửi tới số điện thoại của bạn.',
                    result
                )
            );
        } catch (error) {
            next(error);
        }
    },

    verifyPhoneNumber: async (req, res, next) => {
        try {
            const { phone_number, verification_code } = req.body;

            // Find user by phone
            const user = await repos.auth.getUserByPhone(phone_number);

            if (!user) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.errorResponse('Người dùng không tồn tại')
                );
            }

            // Find verification token
            const verificationToken = await repos.auth.getVerificationTokenByUserIdAndPhoneNumberAndVerificationCode(
                user._id,
                phone_number,
                verification_code
            );

            if (!verificationToken) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã xác thực không hợp lệ hoặc đã hết hạn')
                );
            }

            // Mark user as verified
            await repos.auth.updateVerificationStatusByUserId(user._id);

            // Delete used verification token
            await repos.auth.deleteVerificationTokenById(verificationToken._id);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Xác thực số điện thoại thành công')
            );
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res, next) => {
        try {
            const { phone_number, password, device_id, device_type } = req.body;

            // Find user by phone
            const user = await repos.auth.getUserByPhone(phone_number, true);

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
            await repos.auth.saveRefreshToken(
                {
                    user_id: user._id,
                    token: refreshToken,
                    device_id,
                    device_type
                }
            );

            // Update last login
            await repos.auth.updateLastLoginByUserId(user._id);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            // Set refreshToken in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
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
    },

    logout: async (req, res, next) => {
        try {
            // Get refresh token from cookie or body]
            const { refreshToken } = req.cookies.refreshToken || req.body;

            if (refreshToken) {
                // Delete refresh token from database
                await repos.auth.deleteRefreshToken(refreshToken);

                // Clear cookie
                res.clearCookie('refreshToken');
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.AUTH.LOGOUT.description + ' thành công')
            );
        } catch (error) {
            next(error);
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            // Get refresh token from cookie or body
            const refreshToken = req.body.refresh_token;
            console.log(refreshToken);
            if (!refreshToken) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Không tìm thấy Refresh Token')
                );
            }

            // Find token in database
            const storedToken = await repos.auth.findRefreshToken(refreshToken);

            if (!storedToken) {
                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Refresh Token không hợp lệ')
                );
            }
            await repos.auth.deleteRefreshToken(refreshToken);
            // Verify refresh token
            try {

                console.log("debug 1");

                const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                console.log("debug 2");
                // Generate new token
                const newToken = jwt.sign(
                    { user_id: decoded.user_id, phone_number: decoded.phone_number },
                    JWT_SECRET,
                    { expiresIn: TOKEN_EXPIRY }
                );
                console.log("debug 3");
                // Generate new refresh token
                const newRefreshToken = jwt.sign(
                    { user_id: decoded.user_id, phone_number: decoded.phone_number },
                    JWT_REFRESH_SECRET,
                    { expiresIn: REFRESH_TOKEN_EXPIRY }
                );
                console.log("debug 4");
                // Store new refresh token in database
                await repos.auth.saveRefreshToken(
                    {
                        user_id: decoded.user_id,
                        token: newRefreshToken,
                    }
                );
                console.log("debug 5");
                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse(
                        ApiConstant.AUTH.REFRESH_TOKEN.description + ' thành công',
                        {
                            token: newToken,
                            refresh_token: newRefreshToken,
                        }
                    )
                );
            } catch (error) {
                // Token expired or invalid
                await repos.auth.deleteRefreshToken(refreshToken);

                res.clearCookie('refreshToken');
                console.log(error);


                return res.status(StatusConstant.UNAUTHORIZED).json(
                    ResponseUtils.unauthorizedResponse('Refresh Token hết hạn hoặc không hợp lệ')
                );
            }
        } catch (error) {
            next(error);
        }
    },

    resetPasswordRequest: async (req, res, next) => {
        try {
            const { phone_number } = req.body;

            // Find user by phone
            const user = await repos.auth.getUserByPhone(phone_number);

            if (!user) {
                // Don't reveal that user doesn't exist for security
                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse('Mã đặt lại mật khẩu đã được gửi nếu số điện thoại có tồn tại')
                );
            }

            // Generate reset code
            const resetCode = crypto.randomInt(100000, 999999).toString();

            // Delete any existing reset tokens for this user
            await repos.auth.deleteAllResetTokenByUserId(user._id);

            // Store reset code
            await repos.auth.saveResetToken(
                {
                    user_id: user._id,
                    phone_number,
                    reset_code: resetCode
                }
            );

            // TODO: Send reset code via SMS (implement with SMS service)

            if (process.env.NODE_ENV === "development") {
                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse(`Mã đặt lại mật khẩu là: ${resetCode}`)
                );
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse('Mã đặt lại mật khẩu đã được gửi tới số điện thoại của bạn')
            );
        } catch (error) {
            next(error);
        }
    },

    verifyPasswordResetCode: async (req, res, next) => {
        try {
            const { phone_number, reset_code } = req.body;

            // Find user by phone
            const user = await repos.auth.getUserByPhone(phone_number);

            if (!user) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Mã đặt lại mật khẩu không hợp lệ')
                );
            }

            // Find reset token
            const resetToken = await repos.auth.findResetTokenByUserIdAndPhoneNumberAndResetCode(
                user._id,
                phone_number,
                reset_code
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
    },

    resetPassword: async (req, res, next) => {
        try {
            const { phone_number, new_password } = req.body;

            // Find user by phone
            const user = await repos.auth.getUserByPhone(phone_number);

            if (!user) {
                return res.status(StatusConstant.BAD_REQUEST).json(
                    ResponseUtils.errorResponse('Không tìm thấy user!')
                );
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            const updateResult = await repos.auth.updatePasswordByUserId(user._id, hashedPassword)

            if (!updateResult)
                return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                    ResponseUtils.serverErrorResponse(ApiConstant.AUTH.RESET_PASSWORD.description + " thất bại")
                );

            // Invalidate all refresh tokens for this user
            await repos.auth.deleteAllRefreshTokenByUserId(user._id);

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(ApiConstant.AUTH.RESET_PASSWORD.description + ' thành công')
            );
        } catch (error) {
            next(error);
        }
    },

    changePassword: async (req, res, next) => {
        try {
            const { current_password, new_password } = req.body;
            const userId = ObjectId.createFromHexString(req.user.user_id);

            // Find user by ID
            const user = await repos.auth.getUserById(userId, true);

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
            const updateResult = repos.auth.updatePasswordByUserId(userId, hashedPassword);

            if (updateResult)
                return res.status(StatusConstant.OK).json(
                    ResponseUtils.successResponse('Thay đổi mật khẩu thành công')
                );

            return res.status(StatusConstant.INTERNAL_SERVER_ERROR).json(
                ResponseUtils.serverErrorResponse('Thay đổi mật khẩu thất bại')
            );
        } catch (error) {
            next(error);
        }
    },

    getUserInfo: async (req, res, next) => {
        try {
            const userId = ObjectId.createFromHexString(req.user.user_id);

            // Find user by ID
            const user = await repos.auth.getUserById(userId);

            if (!user) {
                return res.status(StatusConstant.NOT_FOUND).json(
                    ResponseUtils.errorResponse('Không tìm thấy người dùng')
                );
            }

            return res.status(StatusConstant.OK).json(
                ResponseUtils.successResponse(
                    ApiConstant.AUTH.ME.description + ' thành công',
                    user
                )
            );
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController
