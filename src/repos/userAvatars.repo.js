import mongoHelper from "../helper/MongoHelper.js";
import DatabaseConstant from "../constants/database.constant.js";

const UserAvatarsRepo = {
    isUserExisting: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const existingUser = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.USER_AVATARS,
                {user_id: id}
            );

            // Simply return a boolean based on whether the user exists
            return existingUser !== null && existingUser !== undefined;
        } catch (err) {
            console.error("Error checking if user exists:", err);
            // In case of error, assume user doesn't exist
            return false;
        }
    },

    getAvatarListByUserId: async (userId) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const isUserExisted = await UserAvatarsRepo.isUserExisting(userId);
            if (!isUserExisted) {
                await mongoHelper.insertOne(
                    DatabaseConstant.COLLECTIONS.USER_AVATARS,
                    {
                        user_id: id,
                        avatars: [],
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                )
            }

            const avatarList = await mongoHelper.findOne(DatabaseConstant.COLLECTIONS.USER_AVATARS,
                {user_id: id});

            return avatarList.avatars || [];
        } catch (err) {
            console.error("Error get avatar list by user id: ", err)
            return []
        }
    },

    addOldUserAvatar: async (userId, oldAvatarUrl) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const isUserExisted = await UserAvatarsRepo.isUserExisting(userId);
            if (!isUserExisted) {
                await mongoHelper.insertOne(
                    DatabaseConstant.COLLECTIONS.USER_AVATARS,
                    {
                        user_id: id,
                        avatars: [],
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                )
            }

            const updateFields = {};
            updateFields.updated_at = new Date();

            // Thêm oldAvatarUrl vào mảng avatars của user
            await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USER_AVATARS,
                { user_id: id },
                {
                    $push: { avatars: oldAvatarUrl },
                    $set: { updated_at: new Date() }
                }
            );

            return await UserAvatarsRepo.getAvatarListByUserId(userId)
        } catch (err) {
            console.error("Error updating user: ", err);
            return null;
        }
    },
}

export default UserAvatarsRepo
