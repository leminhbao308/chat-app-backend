import mongoHelper from "../helper/mongo.helper.js";
import DatabaseConstant from "../constants/database.constant.js";
import repos from "./index.js";
import ValidationConstant from "../constants/validation.constant.js";
import "dotenv/config";

const ConversationsRepo = {
    async getConversationsForUser(userId) {
        try {
            const id = mongoHelper.extractObjectId(userId);

            const conversations = await mongoHelper.find(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {"participants._id": id}
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
                    $and: [
                        { "participants._id": mongoHelper.extractObjectId(userId1) },
                        { "participants._id": mongoHelper.extractObjectId(userId2) },
                        { "participants": { $size: 2 } }
                    ]
                }
            );

            if (existingConversation) {
                return existingConversation;
            }

            // Thông tin 2 user
            const user1 = await repos.auth.getUserById(userId1);
            const user2 = await repos.auth.getUserById(userId2);

            // Tạo conversation mới
            const newConversation = {
                name: "",
                conversation_url: process.env.DEFAULT_GROUP_THUMBNAIL_URL,
                type: ValidationConstant.CONVERSATION_TYPE.PRIVATE,
                participants: [
                    {
                        _id: user1._id,
                        first_name: user1.first_name,
                        last_name: user1.last_name,
                        avatar_url: user1.avatar_url
                    },
                    {
                        _id: user2._id,
                        first_name: user2.first_name,
                        last_name: user2.last_name,
                        avatar_url: user2.avatar_url
                    }
                ],
                created_at: new Date(),
                updated_at: new Date(),
                messages: [],
                pin_messages:[],
                files:[]
            };

            return await mongoHelper.insertOne(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                newConversation
            );
        } catch (error) {
            console.error("Error creating conversation for contacts:", error);
            return null
        }
    },

    async isUserParticipateInConversation(conversationId, userId) {
        try {
            const result = await mongoHelper.count(
                DatabaseConstant.COLLECTIONS.CONVERSATIONS,
                {
                    _id: mongoHelper.extractObjectId(conversationId),
                    "participants._id": mongoHelper.extractObjectId(userId)
                }
            );

            return result > 0;
        } catch (error) {
            console.error("Error checking user is participating in conversation: ", error);
            return false;
        }
    }
}

export default ConversationsRepo
