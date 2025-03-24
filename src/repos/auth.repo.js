import mongoHelper from "../helper/MongoHelper.js";
import DatabaseConstant from "../constants/databaseConstant.js";

const AuthRepo = {

    isUserExisting: async (phone_number) => {
        try {
            const existingUser = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {phone_number}
            );

            // Simply return a boolean based on whether the user exists
            return existingUser !== null && existingUser !== undefined;
        } catch (err) {
            console.error("Error checking if user exists:", err);
            // In case of error, assume user doesn't exist
            return false;
        }
    },

    saveUser: async (user) => {
        try {
            const result = await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.USERS, user);

            // Return the inserted user
            return await AuthRepo.getUserById(result.insertedId)
        } catch (err) {
            console.error("Error creating user: ", err)
            return null;
        }
    },

    saveVerificationToken: async (userId, phoneNumber, verificationCode) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS, {
                user_id: id,
                phoneNumber,
                verification_code: verificationCode,
                expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
                created_at: new Date()
            });

            // TODO: implement return object
        } catch (err) {
            console.error("Error saving verification code: ", err);
            return null;
        }
    },

    saveRefreshToken: async (refreshTokenPayload) => {
        try {
            const userId = mongoHelper.extractObjectId(refreshTokenPayload.user_id)

            await mongoHelper.insertOne(DatabaseConstant.COLLECTIONS.REFRESH_TOKENS, {
                user_id: userId,
                token: refreshTokenPayload.token,
                device_id: refreshTokenPayload.device_id,
                device_type: refreshTokenPayload.device_type,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                created_at: new Date()
            });

            // TODO: implement return object
        } catch (err) {
            console.error("Error saving refresh token: ", err);
            return null;
        }
    },

    saveResetToken: async (resetTokenPayload) => {
        try {
            const userId = mongoHelper.extractObjectId(resetTokenPayload.user_id);

            await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {
                    user_id: userId,
                    phone_number: resetTokenPayload.phone_number,
                    reset_code: resetTokenPayload.reset_code,
                    expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                    created_at: new Date()
                }
            );

            // TODO: implement return object
        } catch (err) {
            console.error("Error saving reset token: ", err);
            return null;
        }
    },

    getUserById: async (userId, includePassword = false) => {
        try {
            // Check if userId is already an ObjectId
            const id = mongoHelper.extractObjectId(userId);

            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: id}
            );

            // Remove password from response if includePassword = false
            if (!includePassword) {
                const {password: _, ...userWithoutPassword} = user;
                return userWithoutPassword ? userWithoutPassword : null;
            }

            return user ? user : null;
        } catch (err) {
            console.error("Error getting user by id: ", err)
            return null;
        }
    },

    getUserByPhone: async (phoneNumber, includePassword = false) => {
        try {
            const user = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {phone_number: phoneNumber}
            );

            // Remove password from response if includePassword = false
            if (!includePassword) {
                const {password: _, ...userWithoutPassword} = user;
                return userWithoutPassword ? userWithoutPassword : null;
            }

            return user ? user : null;
        } catch (err) {
            console.error("Error getting user by phone: ", err)
            return null;
        }
    },

    getVerificationTokenByUserIdAndPhoneNumberAndVerificationCode: async (userId, phoneNumber, verificationCode) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            return await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS,
                {
                    user_id: id,
                    phoneNumber,
                    verificationCode,
                    expires_at: {$gt: new Date()}
                }
            );
        } catch (err) {
            console.error("Error getting verification code: ", err);
            return null;
        }
    },

    updatePasswordByUserId: async (userId, newPassword) => {
        try {
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: userId},
                {$set: {password: newPassword, updated_at: new Date()}}
            );
            return true;
        } catch (err) {
            console.error("Error update password by user id: ", err)
            return false;
        }
    },

    updateVerificationStatusByUserId: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: id},
                {$set: {is_verified: true, updated_at: new Date()}}
            );
        } catch (err) {
            console.error("Error update verification status: ", err)
        }
    },

    updateLastLoginByUserId: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                {_id: id},
                {$set: {last_login: new Date(), updated_at: new Date()}}
            );
        } catch (err) {
            console.error("Error updating last login status: ", err);
        }
    },

    findResetTokenByUserIdAndPhoneNumberAndResetCode: async (userId, phoneNumber, resetCode) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const resetToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {
                    user_id: id,
                    phoneNumber,
                    resetCode,
                    expires_at: {$gt: new Date()}
                }
            );

            return resetToken ? resetCode : null;
        } catch (err) {
            console.error("Error find reset code: ", err)
            return null;
        }
    },

    findRefreshToken: async (refreshToken) => {
        try {
            const storedToken = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                {token: refreshToken}
            );

            return storedToken ? storedToken : null;
        } catch (err) {
            console.error("Error find refresh token: ", err)
            return null;
        }
    },

    deleteResetTokenById: async (resetTokenId) => {
        try {
            const id = mongoHelper.extractObjectId(resetTokenId);

            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {_id: id}
            );
        } catch (err) {
            console.error("Error delete reset token: ", err)
        }
    },

    deleteAllResetTokenByUserId: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.PASSWORD_RESET_TOKENS,
                {user_id: id}
            );
        } catch (err) {
            console.error("Error delete all reset token: ", err)
        }
    },

    deleteAllRefreshTokenByUserId: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            await mongoHelper.deleteMany(
                DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                {user_id: id}
            );
        } catch (err) {
            console.error("Error delete all refresh token: ", err)
        }
    },

    deleteRefreshToken: async (refreshToken) => {
        try {
            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.REFRESH_TOKENS,
                {token: refreshToken}
            );
        } catch (err) {
            console.error("Error deleting refresh token: ", err)
        }
    },

    deleteVerificationTokenById: async (verificationTokenId) => {
        try {
            const id = mongoHelper.extractObjectId(verificationTokenId);

            await mongoHelper.deleteOne(
                DatabaseConstant.COLLECTIONS.VERIFICATION_TOKENS,
                {_id: verificationTokenId}
            );
        } catch (err) {
            console.error("Error delete verification token: ", err)
        }
    },

};

export default AuthRepo;
