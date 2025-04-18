import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";

const ConversationsRepo = {
    async getConversationsForUser(userId) {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const conversations = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {participants: id}
            )

            return conversations || []
        } catch (err) {
            console.error("Error getting conversations: ", err)
            return []
        }
    },

    async createConversationForContacts(userId1, userId2) {
        try {
            // Kiểm tra xem conversation đã tồn tại chưa
            const existingConversation = await mongoHelper.findOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    participants: {
                        $all: [
                            mongoHelper.extractObjectId(userId1),
                            mongoHelper.extractObjectId(userId2)
                        ],
                        $size: 2
                    }
                }
            );

            if (existingConversation) {
                return existingConversation;
            }

            // Tạo conversation mới
            const newConversation = {
                participants: [
                    mongoHelper.extractObjectId(userId1),
                    mongoHelper.extractObjectId(userId2)
                ],
                created_at: new Date(),
                updated_at: new Date(),
                messages: []
            };

            return await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                newConversation
            );
        } catch (error) {
            console.error("Error creating conversation for contacts:", error);
            return null
        }
    }
}

export default ConversationsRepo
