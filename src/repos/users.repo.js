import authRepo from "./auth.repo.js";
import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";

const UsersRepo = {

    getAllUsersByPhoneNumber: async (phoneQuery, includePassword = false) => {
        try {
            // Sử dụng regex để tìm kiếm một phần của số điện thoại
            const query = { phone_number: { $regex: phoneQuery, $options: 'i' } };

            const users = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.USERS,
                query
            );

            // Remove password from each user if includePassword = false
            if (!includePassword && users.length > 0) {
                return users.map(user => {
                    const { password: _, ...userWithoutPassword } = user;
                    return userWithoutPassword;
                });
            }

            return users;
        } catch (err) {
            console.error("Error getting users by phone query: ", err);
            return [];
        }
    },

    updateUserInfo: async (userId, userInfoPayload) => {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const updateFields = {};
            updateFields.updated_at = new Date();

            if (userInfoPayload.first_name)
                updateFields.first_name = userInfoPayload.first_name;
            if (userInfoPayload.last_name)
                updateFields.last_name = userInfoPayload.last_name;
            if (userInfoPayload.gender)
                updateFields.gender = userInfoPayload.gender;
            if (userInfoPayload.date_of_birth)
                updateFields.date_of_birth = userInfoPayload.date_of_birth;
            if (userInfoPayload.avatar_url)
                updateFields.avatar_url = userInfoPayload.avatar_url;
            if (userInfoPayload.thumbnail_url)
                updateFields.thumbnail_url = userInfoPayload.thumbnail_url;
            if (userInfoPayload.phone_number)
                updateFields.phone_number = userInfoPayload.phone_number;
            if (userInfoPayload.is_active)
                updateFields.is_active = userInfoPayload.is_active;
            if (userInfoPayload.online_status)
                updateFields.online_status = userInfoPayload.online_status;

            // Nếu không có trường nào được cập nhật, trả về null
            if (Object.keys(updateFields).length === 0) {
                console.warn("No fields to update");
                return null;
            }

            // Sử dụng $set để chỉ cập nhật các trường được cung cấp
            const result = await mongoHelper.updateOne(
                DatabaseConstant.COLLECTIONS.USERS,
                { _id: id },
                { $set: updateFields }
            );

            // Kiểm tra xem update có thành công không
            if (result && result.modifiedCount > 0) {
                // Trả về user đã được cập nhật
                return await authRepo.getUserById(id);
            }

            return null;
        } catch (err) {
            console.error("Error updating user: ", err);
            return null;
        }
    },
}

export default UsersRepo;
