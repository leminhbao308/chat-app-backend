import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";

const AuthRepo = {

    isUserExisting: async (phoneNumberOrUserId) => {
        try {
            // Check if the input might be a user ID
            const query = isNaN(phoneNumberOrUserId) ?
                {$or: [{phone_number: phoneNumberOrUserId}, {_id: phoneNumberOrUserId}]} :
                {phone_number: phoneNumberOrUserId};

            const existingUser = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USERS,
                query
            );

            // Return a boolean based on whether the user exists
            return !!existingUser;
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

            return true;
        } catch (err) {
            console.error("Error saving refresh token: ", err);
            return false;
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
};

export default AuthRepo;
